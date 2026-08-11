# Panduan Setup: Data Bersama via Google Sheets

Dengan setup ini, data Aplikasi Stock Barang akan tersimpan di 1 Google Sheets
(bukan lagi di browser masing-masing komputer), jadi bisa dibuka & diedit dari
komputer/HP manapun dan datanya tetap sama.

## Langkah 1 — Buat Google Sheet Baru

1. Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru.
2. Beri nama bebas, misalnya "Database Stock Barang".
3. Anda tidak perlu membuat sheet/kolom manual — nanti dibuat otomatis oleh script.

## Langkah 2 — Pasang Script

1. Di Google Sheet tadi, klik menu **Extensions → Apps Script**.
2. Hapus semua kode contoh (`function myFunction() {...}`) yang ada di editor.
3. Buka file `google-apps-script/Code.gs` dari paket aplikasi ini, copy semua isinya, lalu paste ke Apps Script editor.
4. Klik ikon **Save** (gambar disket) di toolbar Apps Script.

## Langkah 3 — Deploy Sebagai Web App

1. Di Apps Script editor, klik tombol **Deploy** (kanan atas) → **New deployment**.
2. Klik ikon gerigi ⚙️ di samping "Select type" → pilih **Web app**.
3. Isi:
   - **Description**: bebas, misal "API Stock Barang"
   - **Execute as**: **Me (email Anda)**
   - **Who has access**: **Anyone**
4. Klik **Deploy**.
5. Google akan minta izin akses (Authorize access) — klik **Continue**, pilih akun Google Anda, lalu klik **Advanced → Buka [nama project] (unsafe) → Allow**. Ini normal karena scriptnya buatan sendiri.
6. Setelah deploy selesai, akan muncul **Web app URL** — copy URL ini (bentuknya seperti `https://script.google.com/macros/s/xxxxxxxxxxxxx/exec`).

## Langkah 4 — Sambungkan Ke Aplikasi

1. Buka file `js/config.js` di paket aplikasi ini pakai text editor.
2. Cari baris:
   ```js
   const API_URL = "PASTE_URL_WEB_APP_DI_SINI";
   ```
3. Ganti bagian `"PASTE_URL_WEB_APP_DI_SINI"` dengan URL Web App yang tadi dicopy. Contoh:
   ```js
   const API_URL = "https://script.google.com/macros/s/xxxxxxxxxxxxx/exec";
   ```
4. Simpan file.

## Langkah 5 — Upload Aplikasi ke Hosting Gratis

**Penting:** Karena aplikasi ini sekarang mengambil data lewat internet (fetch), aplikasinya
tidak bisa cuma dibuka dengan cara double-click file `index.html` dari komputer — harus
diakses lewat alamat web (http/https), supaya bisa dibuka dari komputer manapun dan
supaya browser tidak memblokir koneksinya. Pilihan termudah & gratis:

**Opsi A — GitHub Pages**
1. Buat akun di [github.com](https://github.com) kalau belum punya.
2. Buat repository baru, upload semua isi folder aplikasi ini (`index.html`, `style.css`, folder `js`).
3. Buka **Settings → Pages** di repository tersebut → pilih branch `main` → Save.
4. Setelah beberapa menit, aplikasi bisa diakses lewat URL seperti `https://namaAnda.github.io/nama-repo/`.

**Opsi B — Netlify Drop**
1. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag & drop folder aplikasi ini (yang berisi `index.html`) ke halaman tersebut.
3. Netlify langsung memberi URL publik yang bisa dibuka dari komputer manapun.

Setelah aplikasi online, bagikan URL-nya ke komputer lain. Selama semua orang membuka
URL yang sama, datanya akan otomatis sama (tersimpan di Google Sheets yang sama).

## Cara Kerja Sinkronisasi

- Setiap kali Tambah / Edit / Hapus / Import data, aplikasi otomatis mengirim
  perubahan ke Google Sheets.
- Setiap 30 detik, aplikasi otomatis menarik ulang data terbaru dari Google Sheets
  (supaya perubahan dari komputer lain ikut muncul).
- Ada juga tombol **REFRESH** di pojok kanan atas untuk menarik data terbaru kapan saja.
- Anda juga bisa melihat/mengedit data langsung dari Google Sheets-nya kalau perlu.

## Catatan

- Karena semua orang menulis ke sheet yang sama, kalau dua orang menyimpan
  perubahan di waktu yang hampir bersamaan, yang tersimpan terakhir yang menang
  (perubahan sebelumnya bisa tertimpa). Untuk pemakaian oleh beberapa orang staf
  gudang, ini biasanya tidak masalah, tapi tetap perlu diperhatikan.
- Google Apps Script gratis punya batas kuota harian (cukup besar untuk pemakaian normal
  toko/gudang kecil-menengah), lihat [dokumentasi kuota Google](https://developers.google.com/apps-script/guides/services/quotas) kalau perlu detail.
