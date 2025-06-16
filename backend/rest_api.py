from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from pydub import AudioSegment
from pydub.utils import which
from PIL import Image
from moviepy import VideoFileClip
from fastapi.middleware.cors import CORSMiddleware

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
        "message": "Welcome to the Media Compressor API. Use the endpoints to compress images, videos, and audio files."
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
