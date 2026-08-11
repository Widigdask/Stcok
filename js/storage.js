/*
=========================================
STORAGE.JS
Sinkronisasi Data via Google Sheets
(lewat Web App Google Apps Script)

Semua data (Data Barang, Barang Masuk, Barang
Keluar) sekarang disimpan di Google Sheets, jadi
bisa diakses & diedit dari komputer manapun,
bukan cuma tersimpan di 1 browser saja.

Fungsi getBarang()/getMasuk()/getKeluar() dan
saveBarang()/saveMasuk()/saveKeluar() sengaja
dibuat dengan nama & cara pakai yang sama seperti
sebelumnya, supaya file lain (barang.js, masuk.js,
keluar.js, stock.js, excel.js) tidak perlu diubah.
=========================================
*/

// ======================================
// Cache Lokal Di Browser (localStorage)
// (Supaya saat halaman dibuka lagi, data terakhir
// bisa langsung ditampilkan tanpa menunggu Google Sheets)
// ======================================

function muatCacheLocal(key) {

    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const hasil = JSON.parse(raw);
        return Array.isArray(hasil) ? hasil : [];
    } catch (err) {
        return [];
    }

}

function simpanCacheLocal(key, data) {

    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        // localStorage penuh/diblokir browser - abaikan, tidak fatal
    }

}

// ======================================
// Cache Data Di Memori
// (Diisi awal dari localStorage supaya langsung ada isinya,
// lalu disegarkan lewat muatSemuaData() saat halaman dibuka,
// dan tetap dipakai supaya baca data lain tetap instan/sinkron)
// ======================================

let _cacheBarang = muatCacheLocal(STORAGE_KEY.BARANG);

let _cacheMasuk = muatCacheLocal(STORAGE_KEY.MASUK);

let _cacheKeluar = muatCacheLocal(STORAGE_KEY.KELUAR);

let _sedangMuatData = false;
let sedangSimpan = false;

// ======================================
// Ambil Data (Sinkron, Dari Cache)
// ======================================

function getBarang() {

    return _cacheBarang;

}

function getMasuk() {

    return _cacheMasuk;

}

function getKeluar() {

    return _cacheKeluar;

}

// ======================================
// Simpan Data (Update Cache + Kirim ke Server)
// ======================================

function saveBarang(data) {

    if (data !== _cacheBarang) {

        _cacheBarang.length = 0;

        data.forEach(item => _cacheBarang.push(item));

    }

    return kirimKeServer("simpanBarang", _cacheBarang);

}


function saveMasuk(data) {

    if (data !== _cacheMasuk) {

        _cacheMasuk.length = 0;

        data.forEach(item => _cacheMasuk.push(item));

    }

    return kirimKeServer("simpanMasuk", _cacheMasuk);

}

function saveKeluar(data) {

    if (data !== _cacheKeluar) {

        _cacheKeluar.length = 0;

        data.forEach(item => _cacheKeluar.push(item));

    }

    return kirimKeServer("simpanKeluar", _cacheKeluar);

}

// ======================================
// Cek URL API Sudah Diisi Atau Belum
// ======================================

function apiSudahDiatur() {

    return typeof API_URL === "string" &&
        API_URL.trim() !== "" &&
        API_URL.indexOf("PASTE_URL") === -1;

}

// ======================================
// Kirim Data Ke Server (Google Sheets)
// Pakai form + iframe tersembunyi (bukan fetch),
// supaya tidak kena masalah CORS/redirect yang sering
// terjadi kalau POST langsung ke Apps Script pakai fetch
// ======================================

function kirimKeServer(action, data) {

    if (!apiSudahDiatur()) {

        gagal("URL Google Apps Script belum diisi. Buka js/config.js lalu isi API_URL (lihat GOOGLE_SHEETS_SETUP.md).");

        return Promise.resolve(null);
    }

    if (!Array.isArray(data)) {
        gagal("Data tidak valid.");
        return Promise.resolve(false);
    }

    if (sedangSimpan) {
        return Promise.resolve(false);
    }

    sedangSimpan = true;

    return new Promise(function (resolve) {

        const namaFrame = "gsFrame_" + Date.now();

        const iframe = document.createElement("iframe");

        iframe.name = namaFrame;

        iframe.style.display = "none";

        document.body.appendChild(iframe);

        const form = document.createElement("form");

        form.method = "POST";

        form.action = API_URL;

        form.target = namaFrame;

        const inputAction = document.createElement("input");

        inputAction.type = "hidden";

        inputAction.name = "action";

        inputAction.value = action;

        form.appendChild(inputAction);

        const inputData = document.createElement("input");

        inputData.type = "hidden";

        inputData.name = "data";

        inputData.value = JSON.stringify(data);

        form.appendChild(inputData);

        document.body.appendChild(form);

        let selesai = false;
        let jumlahLoad = 0;

        // Jaring pengaman: kalau deteksi selesai di bawah ini karena
        // suatu hal tidak berhasil, tetap lanjut maksimal 3 detik
        // (sama seperti sebelumnya) supaya aplikasi tidak macet.
        const batasWaktu = setTimeout(bereskan, 3000);

        function bereskan() {

            if (selesai) return;
            selesai = true;

            clearTimeout(batasWaktu);
            if (form.parentNode) document.body.removeChild(form);
            if (iframe.parentNode) document.body.removeChild(iframe);
            sedangSimpan = false;
            resolve(true);

        }

        // Event "load" PERTAMA pada iframe adalah frame kosong saat
        // baru dibuat (bawaan browser), bukan hasil kiriman data.
        // Event "load" KEDUA barulah respons asli dari Google Apps
        // Script setelah form.submit(). Dengan begini, kalau server
        // merespons cepat (biasanya kurang dari 3 detik), pengguna
        // tidak perlu menunggu penuh 3 detik untuk lanjut.
        iframe.addEventListener("load", function () {
            jumlahLoad++;
            if (jumlahLoad >= 2) bereskan();
        });

        form.submit();

    });

}

// ======================================
// Rapikan Data Barang Dari Server
// ======================================

function normalisasiBarang(item) {

    return {

        kode: String(item.kode || "").trim(),

        nama: String(item.nama || "").trim(),

        satuan: String(item.satuan || "").trim(),

        stokAwal: Number(item.stokAwal) || 0,

        harga: Number(item.harga) || 0

    };

}

// ======================================
// Rapikan Data Transaksi (Masuk/Keluar) Dari Server
// ======================================

function normalisasiTransaksi(item) {

    let tanggal = item.tanggal;

    if (tanggal && typeof tanggal !== "string") {

        const d = new Date(tanggal);

        tanggal = isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);

    } else if (typeof tanggal === "string" && tanggal.length > 10) {

        tanggal = tanggal.slice(0, 10);

    }

    return {

        tanggal: tanggal || "",

        kode: String(item.kode || "").trim(),

        nama: String(item.nama || "").trim(),

        qty: Number(item.qty) || 0,

        keterangan: String(item.keterangan || "").trim()

    };

}

// ======================================
// Ambil Semua Data Dari Server (Google Sheets)
// Dipanggil saat halaman dibuka & saat refresh manual
// ======================================

async function muatSemuaData(diam) {

    if (!apiSudahDiatur()) {
        if (!diam) gagal("URL Google Apps Script belum diisi. Buka js/config.js lalu isi API_URL (lihat GOOGLE_SHEETS_SETUP.md).");
        return;
    }

    if (_sedangMuatData) return;
    _sedangMuatData = true;

    try {
        const res = await fetch(API_URL, {
            method: "GET",
            cache: "no-store"
        });
        if (!res.ok) throw new Error("Status " + res.status);
        const hasil = await res.json();
        _cacheBarang.length = 0;
        (hasil.barang || []).forEach(item => _cacheBarang.push(normalisasiBarang(item)));
        _cacheMasuk.length = 0;
        (hasil.masuk || []).forEach(item => _cacheMasuk.push(normalisasiTransaksi(item)));
        _cacheKeluar.length = 0;
        (hasil.keluar || []).forEach(item => _cacheKeluar.push(normalisasiTransaksi(item)));

        // Simpan salinan ke localStorage supaya kunjungan berikutnya
        // bisa langsung tampil dari cache dulu tanpa menunggu server.
        simpanCacheLocal(STORAGE_KEY.BARANG, _cacheBarang);
        simpanCacheLocal(STORAGE_KEY.MASUK, _cacheMasuk);
        simpanCacheLocal(STORAGE_KEY.KELUAR, _cacheKeluar);
    } catch (err) {
        // Saat sync otomatis di latar belakang (diam=true), jangan
        // ganggu pengguna dengan alert setiap kali gagal/koneksi lambat.
        if (!diam) {
            gagal("Gagal memuat data dari server: " + err.message);
        } else {
            console.error("Sinkron latar belakang gagal:", err.message);
        }
    } finally {
        _sedangMuatData = false;
    }
}
