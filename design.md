# System Design: Modular Uploader API (ElysiaJS & Telegram CDN)

Dokumen ini merinci arsitektur direktori dan pemisahan logika (modularisasi) untuk layanan Uploader gambar ke Telegram menggunakan **ElysiaJS** dan **Bun**. Desain ini dirancang agar mudah diskalakan, dikelola, dan diintegrasikan dengan komponen lain (seperti Database PostgreSQL) di masa mendatang.

## Struktur Direktori (Directory Tree)

Konsep utama dari arsitektur ini adalah _Separation of Concerns_ (Pemisahan Tugas). Setiap lapisan memiliki tanggung jawab spesifik.

```text
app-uploader/
├── src/
│   ├── config/
│   │   └── env.ts         # Lapisan Konfigurasi & Variabel Lingkungan
│   ├── services/
│   │   └── telegram.ts    # Lapisan Integrasi Eksternal (Telegram API)
│   ├── handlers/
│   │   └── upload.ts      # Lapisan Kontroler / Logika Bisnis
│   ├── routes/
│   │   └── index.ts       # Lapisan Penghubung (Router API)
│   └── index.ts           # Titik Masuk (Entry Point) Utama Aplikasi
├── package.json
└── tsconfig.json
```

---

## Penjelasan Komponen Utama

### 1. `config/env.ts` (Konfigurasi)

Bertindak sebagai pusat sumber kebenaran (_Single Source of Truth_) untuk semua pengaturan variabel lingkungan. Tidak ada data rahasia (_hardcoded_) di dalam file logika.

- **Tugas:** Menyimpan `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, port server, dan nantinya kredensial database.

### 2. `services/telegram.ts` (Layanan Inti)

Berisi fungsi-fungsi murni (_pure functions_) yang berinteraksi dengan dunia luar (pihak ketiga). Modul ini _agnostik_ terhadap HTTP request dari pengguna aplikasi.

- **Tugas:** Menerima _file_ murni, membungkusnya dalam `FormData`, melakukan _request_ HTTP ke API Telegram (`sendPhoto`), menangani _error_ API pihak ketiga, dan mengembalikan `file_id`.

### 3. `handlers/upload.ts` (Pengendali Alur / Bisnis Logika)

Berfungsi sebagai konduktor atau perantara. Handler tidak peduli pada _bagaimana_ cara mengunggah gambar ke Telegram; ia hanya tahu _siapa_ yang harus dipanggil.

- **Tugas:**
  1. Menerima _input_ (`body`) dari request HTTP.
  2. Memanggil `telegram.ts` (Service) untuk memproses unggahan file.
  3. (Nantinya) Memanggil Service Database untuk mencatat _log_ atau menyimpan relasi _chapter_.
  4. Menyusun dan mengirimkan respons HTTP (JSON) sukses atau gagal ke klien dengan HTTP Status Code yang tepat (200, 400, 500).

### 4. `routes/index.ts` (Pengatur Rute)

Modul deklaratif yang sangat bersih. Fungsinya memetakan URL/Endpoint ke Handler yang tepat, sekaligus menjadi penjaga gerbang pertama untuk validasi data.

- **Tugas:** Mendeklarasikan rute `POST /api/upload`, memastikan input `image` benar-benar ada dan bertipe _File_ menggunakan skema validasi bawaan Elysia (`t.File()`), lalu meneruskannya ke fungsi `handleUpload`.

### 5. `index.ts` (Entry Point Utama)

File ini sangat minimalis. Fungsinya semata-mata merakit semua potongan blok (seperti rute API dan konfigurasi) menjadi satu kesatuan _instance_ server Elysia dan menjalankannya (_listen_).

---

## Keuntungan Desain Modular

1.  **Mudah Diuji (Testable):** Anda bisa menguji fungsionalitas pengiriman Telegram (`services/telegram.ts`) secara independen tanpa harus menjalankan _server_ web secara utuh menggunakan _mock data_.
2.  **Fleksibilitas (_Swapability_):** Jika suatu hari Anda ingin bermigrasi dari Telegram ke AWS S3 atau Cloudflare R2, Anda cukup membuat file `services/s3.ts` dan mengubah satu baris pemanggilan di `handlers/upload.ts`. Lapisan Endpoint dan Router sama sekali tidak perlu diubah.
3.  **Siap Terintegrasi:** Struktur kode terisolasi ini siap untuk disisipkan sistem _middleware_ (seperti sistem keamanan Autentikasi JWT atau pembatasan _Rate-Limiting_) langsung di lapisan _Routes_ tanpa menodai logika _Service_ dan _Handler_.
