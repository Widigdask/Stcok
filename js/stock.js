/*
=========================================
STOCK.JS
Halaman STOCK GUDANG
Stok Awal / Total Masuk / Total Keluar / Stok Akhir
dihitung otomatis dari:
DATA BARANG + BARANG MASUK - BARANG KELUAR
HARGA BARANG diinput/diimport manual di sini
(disimpan pada data barang berdasarkan KODE)
=========================================
*/

// ======================================
// Hitung Total Masuk Berdasarkan Kode
// ======================================

function totalMasukByKode(kode) {

    const dataMasuk = getMasuk();

    return dataMasuk
        .filter(item => item.kode.toLowerCase() === kode.toLowerCase())
        .reduce((total, item) => total + Number(item.qty), 0);

}

// ======================================
// Hitung Total Keluar Berdasarkan Kode
// ======================================

function totalKeluarByKode(kode) {

    const dataKeluar = getKeluar();

    return dataKeluar
        .filter(item => item.kode.toLowerCase() === kode.toLowerCase())
        .reduce((total, item) => total + Number(item.qty), 0);

}

// ======================================
// Ambil Stok Akhir Berdasarkan Kode
// (Dipakai untuk validasi Barang Keluar)
// ======================================

function stokAkhirByKode(kode) {

    const dataBarang = getBarang();

    const item = dataBarang.find(
        b => b.kode.toLowerCase() === kode.toLowerCase()
    );

    if (!item) return 0;

    const totalMasuk = totalMasukByKode(kode);

    const totalKeluar = totalKeluarByKode(kode);

    return Number(item.stokAwal) + totalMasuk - totalKeluar;

}

// ======================================
// Bangun Data Stock Gudang Lengkap
// ======================================

function getStockData() {

    const dataBarang = getBarang();

    return dataBarang.map(item => {

        const totalMasuk = totalMasukByKode(item.kode);

        const totalKeluar = totalKeluarByKode(item.kode);

        const stokAkhir = Number(item.stokAwal) + totalMasuk - totalKeluar;

        return {

            kode: item.kode,

            nama: item.nama,

            satuan: item.satuan,

            stokAwal: Number(item.stokAwal),

            totalMasuk,

            totalKeluar,

            stokAkhir,

            harga: Number(item.harga)

        };

    });

}

// ======================================
// Render Tabel Stock Gudang
// ======================================

function renderStock(data = getStockData()) {

    const tbody = document.getElementById("tbodyStock");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Belum ada data stock.
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((item, index) => {

        tbody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${item.kode}</td>

            <td>${item.nama}</td>

            <td>${formatAngka(item.stokAwal)}</td>

            <td>${formatAngka(item.totalMasuk)}</td>

            <td>${formatAngka(item.totalKeluar)}</td>

            <td>${formatAngka(item.stokAkhir)}</td>

            <td>${formatRupiah(item.harga)}</td>

        </tr>

        `;

    });

}

// ======================================
// Tambah / Update Harga Barang
// (Stok Awal, Masuk, Keluar, Akhir tetap otomatis.
// Di sini hanya menyimpan HARGA BARANG per kode)
// ======================================

async function tambahHargaStock() {

    const kode = document.getElementById("kodeStock").value.trim();

    const harga = Number(
        document.getElementById("hargaStock").value
    );

    if (kode === "") {

        gagal("Kode barang wajib diisi.");

        return;

    }

    if (isNaN(harga)) {

        gagal("Harga harus berupa angka.");

        return;

    }

    const item = barang.find(
        b => b.kode.toLowerCase() === kode.toLowerCase()
    );

    if (!item) {

        gagal("Kode barang tidak ditemukan. Tambahkan barangnya dulu di tab DATA BARANG.");

        return;

    }

    item.harga = harga;

    await saveBarang(barang);

    renderStock();

    clearStockForm();

    sukses("Harga barang berhasil disimpan.");

}

// ======================================
// Bersihkan Form Stock Gudang
// ======================================

function clearStockForm() {

    document.getElementById("kodeStock").value = "";

    document.getElementById("hargaStock").value = "";

}

// ======================================
// Event Tombol Tambah Harga
// ======================================

const btnTambahStock = document.getElementById("btnTambahStock");

if (btnTambahStock) {

    btnTambahStock.addEventListener("click", tambahHargaStock);

}

// ======================================
// Import Excel (Harga Barang)
// ======================================

const btnImportStock = document.getElementById("btnImportStock");

if (btnImportStock) {

    btnImportStock.addEventListener("click", function () {

        document.getElementById("importStock").click();

    });

}

// ======================================
// Submit Form Dengan Tombol Enter
// ======================================

["kodeStock", "hargaStock"].forEach(function (id) {

    const input = document.getElementById(id);

    if (!input) return;

    input.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            tambahHargaStock();

        }

    });

});

// ======================================
// Pencarian Stock Gudang
// ======================================

const cariStock = document.getElementById("cariStock");

if (cariStock) {

    cariStock.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const hasil = getStockData().filter(item =>

            item.kode.toLowerCase().includes(keyword) ||

            item.nama.toLowerCase().includes(keyword)

        );

        renderStock(hasil);

    });

}

// ======================================
// Export Excel Stock Gudang
// ======================================

const btnExportStock = document.getElementById("btnExportStock");

if (btnExportStock) {

    btnExportStock.addEventListener("click", function () {

        if (typeof exportStockExcel === "function") {

            exportStockExcel();

        }

    });

}

// ======================================
// Render Awal
// ======================================

renderStock();
