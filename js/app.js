/*
=========================================
APP.JS
Inisialisasi Awal Aplikasi
Data diambil & disimpan lewat Google Sheets,
lihat js/config.js untuk mengisi API_URL.
=========================================
*/

// ======================================
// Render Ulang Seluruh Tabel
// ======================================

function renderSemua() {

    if (typeof renderBarang === "function") renderBarang();

    if (typeof renderMasuk === "function") renderMasuk();

    if (typeof renderKeluar === "function") renderKeluar();

    if (typeof renderStock === "function") renderStock();

}

// ======================================
// Tampilkan / Sembunyikan Overlay Loading
// ======================================

function tampilkanLoading(tampil) {

    const overlay = document.getElementById("loadingOverlay");

    if (!overlay) return;

    overlay.style.display = tampil ? "flex" : "none";

}

// ======================================
// Inisialisasi Aplikasi
// (Ambil data dari Google Sheets dulu,
// baru render semua tabel)
// ======================================

async function initApp() {

    tampilkanLoading(true);

    try {

        if (typeof muatSemuaData === "function") {

            await muatSemuaData();

        }

        renderSemua();

    } catch (err) {

        console.error(err);

        gagal("Gagal memuat data dari Google Sheets.");

    } finally {

        tampilkanLoading(false);

    }

}

// ======================================
// Tombol Refresh Manual
// (Untuk narik perubahan terbaru dari komputer lain)
// ======================================

const btnRefreshData = document.getElementById("btnRefreshData");

if (btnRefreshData) {

    btnRefreshData.addEventListener("click", async function () {

        tampilkanLoading(true);

        await muatSemuaData();

        renderSemua();

        tampilkanLoading(false);

        sukses("Data terbaru berhasil dimuat.");

    });

}

// ======================================
// Sinkron Otomatis Secara Berkala
// (Supaya perubahan dari komputer lain ikut
// muncul tanpa harus refresh manual terus-menerus)
// ======================================

setInterval(async function () {

    if (typeof muatSemuaData === "function") {

        await muatSemuaData();

        renderSemua();

    }

}, 30000);

// ======================================
// Jalankan Saat DOM Siap
// ======================================

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initApp);

} else {

    initApp();

}
