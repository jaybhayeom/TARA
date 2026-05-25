import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Tara - AI Assistant",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    // In development, load the Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Debug: see console errors
  } else {
    // In production, load the built static files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // Set up IPC handlers for secure OS keychain storage
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

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
