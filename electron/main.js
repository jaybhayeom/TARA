import { app, BrowserWindow, ipcMain, safeStorage, clipboard, shell, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { spawn } from 'child_process';
import pkgUpdater from 'electron-updater';
const { autoUpdater } = pkgUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
let mainWindow = null;
let splashWindow = null;
let serverProcess = null;
let currentDownloads = new Map();

// Helper to get writeable server directory
const getKokoroServerDir = () => {
  if (!app.isPackaged) {
    return path.join(app.getAppPath(), 'kokoro-server');
  }
  
  // In production (packaged exe), use the userData directory for downloads and execution
  const userDataPath = path.join(app.getPath('userData'), 'kokoro-server');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // Ensure server.py is copied out of the read-only ASAR to the userData directory so Python can execute it
  const destServerPy = path.join(userDataPath, 'server.py');
  if (!fs.existsSync(destServerPy)) {
    try {
      const srcServerPy = path.join(app.getAppPath(), 'kokoro-server', 'server.py');
      if (fs.existsSync(srcServerPy)) {
        fs.copyFileSync(srcServerPy, destServerPy);
      } else {
        // Fallback: write a basic server.py if it is missing
        fs.writeFileSync(destServerPy, `import os
import io
import urllib.request
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from kokoro_onnx import Kokoro

MODEL_FILE = "model.onnx"
VOICES_FILE = "voices.bin"

if not os.path.exists(MODEL_FILE):
    urllib.request.urlretrieve("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx", MODEL_FILE)

if not os.path.exists(VOICES_FILE):
    urllib.request.urlretrieve("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin", VOICES_FILE)

kokoro = Kokoro(MODEL_FILE, VOICES_FILE)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    input: str
    voice: str = "af_heart"
    speed: float = 1.0

@app.get("/health")
async def health():
    voices = kokoro.get_voices()
    return JSONResponse({"status": "ok", "voices": voices})

@app.post("/v1/audio/speech")
async def speech(req: TTSRequest):
    samples, sample_rate = kokoro.create(req.input, voice=req.voice, speed=req.speed)
    import soundfile as sf
    buffer = io.BytesIO()
    sf.write(buffer, samples, sample_rate, format='WAV', subtype='PCM_16')
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="audio/wav")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8880)
`);
      }
    } catch (e) {
      console.error("Failed to copy server.py", e);
    }
  }

  return userDataPath;
};

// Helper to download files with progress support (handles 301/302 redirects)
const downloadWithProgress = (url, destPath, onProgress) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath + '.tmp');
    let receivedBytes = 0;
    let totalBytes = 0;

    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect recursively
        downloadWithProgress(response.headers.location, destPath, onProgress)
          .then(resolve)
          .catch(reject);
        file.close();
        try { fs.unlinkSync(destPath + '.tmp'); } catch(e) {}
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download (Status Code: ${response.statusCode})`));
        return;
      }

      totalBytes = parseInt(response.headers['content-length'], 10) || 0;

      response.on('data', (chunk) => {
        receivedBytes += chunk.length;
        file.write(chunk);
        
        if (totalBytes > 0) {
          const percent = Math.round((receivedBytes / totalBytes) * 100);
          onProgress({ loaded: receivedBytes, total: totalBytes, percent });
        }
      });

      response.on('end', () => {
        file.end();
        fs.rename(destPath + '.tmp', destPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    request.on('error', (err) => {
      file.close();
      try { fs.unlinkSync(destPath + '.tmp'); } catch(e) {}
      reject(err);
    });

    request.end();
  });
};

function createWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0c0c14',
    icon: path.join(__dirname, '../build/icon.ico'),
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  // Secure Storage IPCs
  ipcMain.handle('safeStorage:isAvailable', () => {
    return safeStorage.isEncryptionAvailable();
  });

  ipcMain.handle('safeStorage:encrypt', (event, plainText) => {
    if (!safeStorage.isEncryptionAvailable()) return null;
    try {
      const buffer = safeStorage.encryptString(plainText);
      return buffer.toString('base64');
    } catch (e) {
      console.error("Encryption failed", e);
      return null;
    }
  });

  ipcMain.handle('safeStorage:decrypt', (event, encryptedBase64) => {
    if (!safeStorage.isEncryptionAvailable()) return null;
    try {
      const buffer = Buffer.from(encryptedBase64, 'base64');
      return safeStorage.decryptString(buffer);
    } catch (e) {
      console.error("Decryption failed", e);
      return null;
    }
  });

  // OS Telemetry IPCs
  ipcMain.handle('system:readClipboard', () => {
    try {
      return clipboard.readText();
    } catch (e) {
      console.error("Failed to read clipboard", e);
      return "";
    }
  });

  // --- Google OAuth ---
  ipcMain.handle('google-auth-login', async (event) => {
    return new Promise((resolve, reject) => {
      const clientId = '717018004786-tjbjr75oponqt12g1haqh5bmvibsce0c.apps.googleusercontent.com';
      
      // Generate PKCE code verifier and challenge
      const codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
      
      let boundPort = null;
      
      const server = http.createServer(async (req, res) => {
        try {
          const reqUrl = new URL(req.url, `http://127.0.0.1:${boundPort}`);
          console.log('[TARA Auth] Received callback:', reqUrl.pathname);
          
          if (reqUrl.pathname === '/callback') {
            const code = reqUrl.searchParams.get('code');
            const error = reqUrl.searchParams.get('error');
            
            if (error) {
              console.error('[TARA Auth] Google error:', error);
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`<html><body style="background:#0c0c14;color:#f87171;font-family:sans-serif;text-align:center;padding:80px;"><h2>Authentication Failed</h2><p>${error}</p></body></html>`);
              server.close();
              return reject(new Error("Google returned error: " + error));
            }
            
            if (code) {
              console.log('[TARA Auth] Got auth code, exchanging for token...');
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end('<html><body style="background:#0c0c14;color:#a78bfa;font-family:sans-serif;text-align:center;padding:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;"><h2 style="font-size:32px;margin-bottom:16px;">✓ Authentication Successful</h2><p style="color:rgba(255,255,255,0.6);">You can close this tab and return to TARA.</p></body></html>');
              
              const redirectUri = `http://127.0.0.1:${boundPort}/callback`;
              
              try {
                const tokenBody = new URLSearchParams({
                  code,
                  client_id: clientId,
                  redirect_uri: redirectUri,
                  grant_type: 'authorization_code',
                  code_verifier: codeVerifier
                });
                
                console.log('[TARA Auth] Token exchange to:', 'https://oauth2.googleapis.com/token');
                console.log('[TARA Auth] redirect_uri:', redirectUri);
                
                const fetchResponse = await net.fetch('https://oauth2.googleapis.com/token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: tokenBody.toString()
                });
                
                const data = await fetchResponse.json();
                console.log('[TARA Auth] Token response keys:', Object.keys(data));
                
                server.close();
                
                if (data.access_token) {
                  console.log('[TARA Auth] Success! Got access token.');
                  resolve(data.access_token);
                } else {
                  console.error('[TARA Auth] Token exchange failed:', JSON.stringify(data));
                  reject(new Error("Token exchange failed: " + (data.error_description || data.error || JSON.stringify(data))));
                }
              } catch (err) {
                server.close();
                console.error('[TARA Auth] Token fetch error:', err);
                reject(err);
              }
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end('<html><body>Auth failed - no code. Close this tab.</body></html>');
              server.close();
              reject(new Error("No authorization code received"));
            }
          } else {
            // Favicon or other requests - ignore
            res.writeHead(200);
            res.end();
          }
        } catch (err) {
          console.error('[TARA Auth] Server handler error:', err);
          res.writeHead(500);
          res.end('Internal Error');
          server.close();
          reject(err);
        }
      });

      server.on('error', (e) => {
        console.error('[TARA Auth] Server error:', e);
        reject(new Error("Auth server failed to start: " + e.message));
      });

      // Bind to port 0 so the OS picks an available port
      server.listen(0, '127.0.0.1', () => {
        boundPort = server.address().port;
        const redirectUri = `http://127.0.0.1:${boundPort}/callback`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile%20email&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        
        console.log('[TARA Auth] Loopback server on port', boundPort);
        console.log('[TARA Auth] Opening browser for auth...');
        
        shell.openExternal(authUrl).catch(err => {
          console.error('[TARA Auth] Failed to open browser:', err);
          server.close();
          reject(new Error("Failed to open browser: " + err.message));
        });
      });
    });
  });

  // --- Kokoro TTS Downloader & Server IPC ---

  ipcMain.handle('kokoro:checkStatus', async () => {
    try {
      const serverDir = getKokoroServerDir();
      const modelPath = path.join(serverDir, 'model.onnx');
      const voicesPath = path.join(serverDir, 'voices.bin');

      const modelExists = fs.existsSync(modelPath);
      const voicesExists = fs.existsSync(voicesPath);

      let modelSize = 0;
      let voicesSize = 0;

      if (modelExists) modelSize = fs.statSync(modelPath).size;
      if (voicesExists) voicesSize = fs.statSync(voicesPath).size;

      return {
        modelExists,
        voicesExists,
        modelSize,
        voicesSize,
        serverRunning: serverProcess !== null,
        serverDir
      };
    } catch (e) {
      console.error("Error checking status:", e);
      return { error: e.message };
    }
  });

  ipcMain.handle('kokoro:stopServer', async () => {
    return await stopKokoroServer();
  });

  // Window Controls
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });
  ipcMain.handle('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });
  ipcMain.handle('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('kokoro:downloadFile', async (event, type) => {
    const serverDir = getKokoroServerDir();
    const fileName = type === 'model' ? 'model.onnx' : 'voices.bin';
    const destPath = path.join(serverDir, fileName);
    
    const url = type === 'model'
      ? 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx'
      : 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin';

    if (currentDownloads.has(type)) {
      return { status: 'already_downloading' };
    }

    currentDownloads.set(type, true);

    downloadWithProgress(url, destPath, (progress) => {
      if (mainWindow) {
        mainWindow.webContents.send('kokoro:downloadProgress', {
          type,
          ...progress
        });
      }
    })
    .then(() => {
      currentDownloads.delete(type);
      if (mainWindow) {
        mainWindow.webContents.send('kokoro:downloadComplete', { type, success: true });
      }
    })
    .catch((err) => {
      currentDownloads.delete(type);
      console.error(`Failed to download ${type}:`, err);
      if (mainWindow) {
        mainWindow.webContents.send('kokoro:downloadComplete', { type, success: false, error: err.message });
      }
    });

    return { status: 'started' };
  });

  ipcMain.handle('kokoro:startServer', async () => {
    if (serverProcess !== null) {
      return { status: 'running' };
    }

    const serverDir = getKokoroServerDir();
    const destServerPy = path.join(serverDir, 'server.py');

    if (!fs.existsSync(destServerPy)) {
      return { status: 'error', error: 'server.py is missing' };
    }

    try {
      serverProcess = spawn('python', ['server.py'], { cwd: serverDir });
      
      serverProcess.stdout.on('data', (data) => {
        const logStr = data.toString();
        console.log('[Kokoro Server]:', logStr);
        if (mainWindow) {
          mainWindow.webContents.send('kokoro:serverLog', logStr);
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const errStr = data.toString();
        console.error('[Kokoro Server Error]:', errStr);
        if (mainWindow) {
          mainWindow.webContents.send('kokoro:serverLog', `[ERROR]: ${errStr}`);
        }
      });

      serverProcess.on('close', (code) => {
        console.log(`[Kokoro Server] exited with code ${code}`);
        serverProcess = null;
        if (mainWindow) {
          mainWindow.webContents.send('kokoro:serverStatus', { status: 'stopped', code });
        }
      });

      return { status: 'started' };
    } catch (e) {
      console.error("Failed to spawn server process", e);
      return { status: 'error', error: e.message };
    }
  });



  // Auto Updater Configuration
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    if (mainWindow) mainWindow.webContents.send('updater:message', { type: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('updater:message', { type: 'update-available', info });
  });

  autoUpdater.on('update-not-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('updater:message', { type: 'update-not-available', info });
  });

  autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('updater:message', { type: 'error', error: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('updater:message', { type: 'download-progress', progress: progressObj });
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('updater:message', { type: 'update-downloaded', info });
  });

  ipcMain.handle('updater:checkForUpdates', () => {
    if (!isDev) {
      autoUpdater.checkForUpdates();
    } else {
      // Mock updater behavior in dev mode for UI testing
      if (mainWindow) {
        mainWindow.webContents.send('updater:message', { type: 'checking' });
        setTimeout(() => {
          mainWindow.webContents.send('updater:message', { type: 'update-not-available' });
        }, 1500);
      }
    }
    return true;
  });

  ipcMain.handle('updater:downloadUpdate', () => {
    if (!isDev) {
      autoUpdater.downloadUpdate();
    }
    return true;
  });

  ipcMain.handle('updater:quitAndInstall', () => {
    if (!isDev) {
      autoUpdater.quitAndInstall();
    }
    return true;
  });

  createWindow();

  // Check for updates shortly after app launches
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 5000);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  // Kill background server if application closes
  if (serverProcess !== null) {
    try { serverProcess.kill(); } catch (e) {}
  }
  if (process.platform !== 'darwin') app.quit();
});
