import streamlit as st
from PIL import Image
import io
from moviepy import VideoFileClip
from pydub.utils import which
from pydub import AudioSegment
import tempfile
import os

AudioSegment.converter = which("ffmpeg")

st.set_page_config(page_title="Media Compressor", layout="centered")
st.title("Media Compressor App")

tab1, tab2, tab3 = st.tabs(
    ["Image Compression", "Video Compression", "Audio Compression"]
)

# Image Compression
with tab1:
    st.header("Compress an Image")
    img_file = st.file_uploader(
        "Upload an image", type=["jpg", "jpeg", "png"], key="img"
    )
    quality = st.slider(
        "Compression Strength (JPEG Quality)", 1, 100, 75, key="img_quality"
    )

    if img_file:
        image = Image.open(img_file)
        original_size = img_file.size / 1024

        img_bytes = io.BytesIO()
        image = image.convert("RGB")
        image.save(img_bytes, format="JPEG", quality=quality)
        compressed_data = img_bytes.getvalue()
        compressed_size = len(compressed_data) / 1024

        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Original")
            st.image(image, use_container_width=True)
            st.caption(f"Size: {original_size:.2f} KB")
        with col2:
            st.subheader("Compressed")
            st.image(compressed_data, use_container_width=True)
            st.caption(f"Size: {compressed_size:.2f} KB")

        st.download_button(
            "Download Compressed Image",
            compressed_data,
            file_name="compressed.jpg",
            mime="image/jpeg",
        )


# Video Compression
with tab2:
    st.header("Compress a Video")
    video_file = st.file_uploader(
        "Upload a video", type=["mp4", "mov", "avi"], key="vid"
    )
    bitrate = st.slider(
        "Compression Bitrate (kbps)", 300, 5000, 1000, key="vid_bitrate"
    )

    if video_file:
        original_video_bytes = video_file.read()
        original_size = len(original_video_bytes) / 1024

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_input:
            temp_input.write(original_video_bytes)
            input_path = temp_input.name

        output_path = input_path.replace(".mp4", "_compressed.mp4")
        clip = VideoFileClip(input_path)
        clip.write_videofile(output_path, bitrate=f"{bitrate}k", audio_codec="aac")

        with open(output_path, "rb") as out_vid:
            compressed_data = out_vid.read()
            compressed_size = len(compressed_data) / 1024

        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Original")
            st.video(original_video_bytes)
            st.caption(f"Size: {original_size:.2f} KB")
        with col2:
            st.subheader("Compressed")
            st.video(compressed_data)
            st.caption(f"Size: {compressed_size:.2f} KB")

        st.download_button(
            "Download Compressed Video",
            compressed_data,
            file_name="compressed_video.mp4",
            mime="video/mp4",
        )

        # Cleanup
        os.remove(input_path)
        os.remove(output_path)


# Audio Compression
with tab3:
    st.header("Compress an Audio File")
    audio_file = st.file_uploader(
        "Upload an audio", type=["mp3", "wav", "ogg", "m4a"], key="aud"
    )
    audio_bitrate = st.slider("Bitrate (kbps)", 32, 320, 128, key="aud_bitrate")

    if audio_file:
        original_audio_bytes = audio_file.read()
        original_size = len(original_audio_bytes) / 1024

        audio = AudioSegment.from_file(io.BytesIO(original_audio_bytes))
        out_audio = io.BytesIO()
        audio.export(out_audio, format="mp3", bitrate=f"{audio_bitrate}k")
        compressed_audio = out_audio.getvalue()
        compressed_size = len(compressed_audio) / 1024

        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Original")
            st.audio(original_audio_bytes)
            st.caption(f"Size: {original_size:.2f} KB")
        with col2:
            st.subheader("Compressed")
            st.audio(compressed_audio)
            st.caption(f"Size: {compressed_size:.2f} KB")

        st.download_button(
            "Download Compressed Audio",
            compressed_audio,
            file_name="compressed_audio.mp3",
            mime="audio/mpeg",
        )
