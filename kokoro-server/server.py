import os
import io
import urllib.request
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from kokoro_onnx import Kokoro

# --- Automatic Weight Downloader ---
MODEL_FILE = "model.onnx"
VOICES_FILE = "voices.bin"

def download_file(url, filename):
    print(f"Downloading {filename}... Please wait (this may take a minute).")
    urllib.request.urlretrieve(url, filename)
    print(f"Successfully downloaded {filename}!")

# Download Kokoro ONNX model and voices if they don't exist locally
if not os.path.exists(MODEL_FILE):
    download_file("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx", MODEL_FILE)

if not os.path.exists(VOICES_FILE):
    download_file("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin", VOICES_FILE)

# --- Start TTS Engine ---
print("Initializing Kokoro TTS Engine...")
kokoro = Kokoro(MODEL_FILE, VOICES_FILE)

app = FastAPI()

# Enable CORS so the Electron app can fetch the audio without issues
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
    """Health check endpoint so the frontend can verify the server is alive."""
    voices = kokoro.get_voices()
    return JSONResponse({"status": "ok", "voices": voices})

@app.post("/v1/audio/speech")
async def speech(req: TTSRequest):
    # Generates voice audio arrays locally on CPU
    samples, sample_rate = kokoro.create(req.input, voice=req.voice, speed=req.speed)
    
    # Pack the raw PCM samples into a standard playable WAV file
    import soundfile as sf
    buffer = io.BytesIO()
    sf.write(buffer, samples, sample_rate, format='WAV', subtype='PCM_16')
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="audio/wav")

if __name__ == "__main__":
    import socket
    
    def find_free_port(start_port, max_port=8900):
        for port in range(start_port, max_port):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('127.0.0.1', port))
                    return port
                except OSError:
                    continue
        return start_port

    target_port = find_free_port(8880)
    print(f"\n--- Kokoro TTS Server is starting on port {target_port} ---", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=target_port)
