from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from pydub import AudioSegment
from pydub.utils import which
from PIL import Image
from moviepy import VideoFileClip
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

import tempfile
import io
import os

app = FastAPI(title="Media Compressor API")

AudioSegment.converter = which("ffmpeg")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # or ["http://localhost:3000"] or your deployed frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Media Compressor API. Use the endpoints to compress images, videos, and audio files.",
        "author": "Fitran Alfian Nizar",
    }


@app.post("/compress/image")
async def compress_image(file: UploadFile = File(...), quality: int = Form(75)):
    img_bytes = io.BytesIO(await file.read())
    image = Image.open(img_bytes).convert("RGB")

    out = io.BytesIO()
    image.save(out, format="JPEG", quality=quality)
    out.seek(0)

    return StreamingResponse(
        out,
        media_type="image/jpeg",
        headers={
            "Content-Disposition": "attachment; filename=compressed.jpg",
            "Content-Length": str(len(out.getvalue())),
        },
    )


@app.post("/compress/video")
async def compress_video(
    file: UploadFile = File(...), bitrate: int = Form(1000)  # in kbps
):
    contents = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_in:
        temp_in.write(contents)
        input_path = temp_in.name

    output_path = input_path.replace(".mp4", "_compressed.mp4")
    clip = VideoFileClip(input_path)
    clip.write_videofile(output_path, bitrate=f"{bitrate}k", audio_codec="aac")

    with open(output_path, "rb") as f:
        compressed_video = f.read()

    os.remove(input_path)
    os.remove(output_path)

    return StreamingResponse(
        io.BytesIO(compressed_video),
        media_type="video/mp4",
        headers={
            "Content-Disposition": "attachment; filename=compressed_video.mp4",
            "Content-Length": str(len(compressed_video)),
        },
    )


@app.post("/compress/audio")
async def compress_audio(
    file: UploadFile = File(...), bitrate: int = Form(128)  # in kbps
):
    audio_bytes = io.BytesIO(await file.read())
    audio = AudioSegment.from_file(audio_bytes)

    out_audio = io.BytesIO()
    audio.export(out_audio, format="mp3", bitrate=f"{bitrate}k")
    out_audio.seek(0)

    return StreamingResponse(
        out_audio,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": "attachment; filename=compressed_audio.mp3",
            "Content-Length": str(len(out_audio.getvalue())),
        },
    )


@app.post("/steganography/image/hide")
async def hide_text_in_image(file: UploadFile = File(...), message: str = Form(...)):
    img_bytes = io.BytesIO(await file.read())
    image = Image.open(img_bytes).convert("RGB")

    data = np.array(image)
    flat_data = data.flatten()

    prefix = "STEGOK4|"
    full_message = prefix + message
    binary_message = "".join(f"{ord(c):08b}" for c in full_message)
    binary_message += "00000000"  # Null terminator to signal end of message

    if len(binary_message) > len(flat_data):
        return {"error": "Message too long to hide in this image."}

    for i in range(len(binary_message)):
        flat_data[i] = (flat_data[i] & 0xFE) | int(binary_message[i])
    stego_data = flat_data.reshape(data.shape)
    stego_image = Image.fromarray(stego_data.astype("uint8"), "RGB")

    out = io.BytesIO()
    stego_image.save(out, format="PNG")  # PNG to prevent recompression
    out.seek(0)

    return StreamingResponse(
        out,
        media_type="image/png",
        headers={
            "Content-Disposition": "attachment; filename=stego_image.png",
            "Content-Length": str(len(out.getvalue())),
        },
    )


@app.post("/steganography/image/reveal")
async def reveal_text_from_image(file: UploadFile = File(...)):
    img_bytes = io.BytesIO(await file.read())
    image = Image.open(img_bytes).convert("RGB")

    data = np.array(image)
    flat_data = data.flatten()

    bits = []
    for value in flat_data:
        bits.append(str(value & 1))

    # Convert bits to characters
    message = ""
    for i in range(0, len(bits), 8):
        byte = "".join(bits[i : i + 8])
        char = chr(int(byte, 2))
        if char == "\x00":  # Null terminator
            break
        message += char

    if not message.startswith("STEGOK4|"):
        return {"hidden_message": "No hidden message detected."}

    hidden_message = message[len("STEGOK4|") :]
    return {"hidden_message": hidden_message}
