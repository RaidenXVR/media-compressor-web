# Aplikasi Kompresi Media
Web aplikasi ini dibuat dengan menggunakan Streamlit untuk mengkompresi file media seperti gambar, video, dan audio. Aplikasi ini memungkinkan pengguna untuk mengunggah file media, membandingkan hasilnya, dan mengunduh versi terkompresi dari file tersebut. Aplikasi ini juga memiliki fitur REST API untuk mengakses fungsi kompresi secara programatik. Aplikasi ini juga memiliki fitur steganografi untuk menyembunyikan pesan dalam file media berupa citra.

## Metode Kompresi
- **Gambar**: Menggunakan library `PIL` untuk mengompres gambar dengan algoritma JPEG.
- **Video**: Menggunakan library `moviepy` untuk mengompres video dengan algoritma H.264 atau AVC.
- **Audio**: Menggunakan library `pydub` untuk mengompres file audio dengan algoritma MPEG-1 Layer III.

## Metode Steganografi
- **Gambar**: Menggunakan library `PIL` untuk menyembunyikan pesan dalam citra dengan metode Least Significant Bit (LSB).

## REST API
Aplikasi ini menyediakan REST API untuk mengakses fungsi kompresi media. Anda dapat mengirim permintaan POST ke endpoint berikut:
- `/compress/image`: Untuk mengompres gambar.
- `/compress/video`: Untuk mengompres video.
- `/compress/audio`: Untuk mengompres audio.
- `/steganography/image/hide`: Untuk menyembunyikan pesan dalam citra.
- `/steganography/image/reveal`: Untuk mengungkap pesan yang tersembunyi dalam citra.

### Instalasi REST API
- Pastikan Anda telah menginstal Python 3.8 atau yang lebih baru.
- Kemudian, instal dependensi yang diperlukan dengan menjalankan perintah berikut:
```bash
pip install -r requirements.txt
```
### Cara Menggunakan REST API
1. Jalankan aplikasi dengan perintah:
   ```bash
   uvicorn app.main:app --reload
   ```
2. Gunakan alat seperti Postman atau curl untuk mengirim permintaan ke endpoint yang sesuai.


## Streamlit
### Instalasi
- Pastikan Anda telah menginstal Python 3.8 atau yang lebih baru. 
- Kemudian, instal dependensi yang diperlukan dengan menjalankan perintah berikut:
```bash
pip install -r requirements.txt
```

### Cara Menggunakan
1. Jalankan aplikasi dengan perintah:
   ```bash
   streamlit run app.py
   ```
2. Buka browser dan akses `http://localhost:8501`.
3. Pilih jenis kompresi yang diinginkan.
4. Unggah file media yang ingin dikompres.

## Developers
Kelompok 4:
- [Fitran Alfian Nizar - 1227050047](https://www.linkedin.com/in/fitran-alfian-nizar-100893135/)
- Imany Fauzi Rahman - 1227050056
- Mahesa Adlan Falah - 1227050067