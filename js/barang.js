/*
=========================================
BARANG.JS
=========================================
*/

let barang = getBarang();

let editIndexBarang = -1;

// ======================================
// Ceklist / Pilih Baris (Pengganti Tombol Hapus Merah)
// Menyimpan index ASLI (posisi di array "barang", bukan
// posisi di hasil pencarian) supaya tetap akurat walau
// tabel sedang difilter oleh pencarian.
// ======================================

let barangTerpilih = new Set();

function updateTombolHapusTerpilihBarang() {

    const btn = document.getElementById("btnHapusTerpilihBarang");

    if (!btn) return;

    const jumlah = barangTerpilih.size;

    btn.innerHTML = jumlah > 0
        ? `<i class="bi bi-trash3"></i> HAPUS TERPILIH (${jumlah})`
        : `<i class="bi bi-trash3"></i> HAPUS TERPILIH`;

}

// ======================================
// Isi Dropdown Kode Barang
// (Dipakai di tab BARANG MASUK & BARANG KELUAR
// supaya kode dipilih dari daftar Data Barang,
// bukan diketik manual)
// ======================================

function renderDaftarKodeBarang() {

    ["kodeMasuk", "kodeKeluar"].forEach(function (id) {

        const select = document.getElementById(id);

        if (!select) return;

        const nilaiTerpilih = select.value;

        select.innerHTML = `<option value="">Pilih Kode Barang</option>`;

        barang.forEach(item => {

            select.innerHTML += `<option value="${item.kode}">${item.kode} - ${item.nama}</option>`;

        });

        // Pertahankan pilihan sebelumnya jika masih ada
        if (nilaiTerpilih && barang.some(b => b.kode === nilaiTerpilih)) {

            select.value = nilaiTerpilih;

        }

    });

}

// ======================================
// Render Tabel Barang
// ======================================

function renderBarang(data = barang) {

    const tbody = document.getElementById("tbodyBarang");

    tbody.innerHTML = "";

    renderDaftarKodeBarang();

    // Reset ceklist setiap kali tabel digambar ulang
    // (data/index bisa berubah setelah tambah/edit/hapus/pencarian)
    barangTerpilih.clear();

    const checkAllBarang = document.getElementById("checkAllBarang");

    if (checkAllBarang) checkAllBarang.checked = false;

    updateTombolHapusTerpilihBarang();

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Belum ada data barang.
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((item, i) => {

        // Index asli di array "barang" (bukan index hasil filter pencarian)
        const realIndex = barang.indexOf(item);

        tbody.innerHTML += `

        <tr>

            <td class="text-center">
                <input type="checkbox" class="form-check-input check-row-barang" data-index="${realIndex}">
            </td>

            <td>${i + 1}</td>

            <td>${item.kode}</td>

            <td>${item.nama}</td>

            <td>${item.satuan}</td>

            <td>${formatAngka(item.stokAwal)}</td>

            <td class="text-center">

                <button
                    class="btn btn-warning btn-sm"
                    data-aksi="edit"
                    data-index="${realIndex}"
                    title="Edit">

                    <i class="bi bi-pencil"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Event Delegation: Tombol Edit
// (Tidak memakai onclick inline di HTML)
// ======================================

document.getElementById("tbodyBarang").addEventListener("click", function (e) {

    const tombol = e.target.closest("button[data-aksi]");

    if (!tombol) return;

    const index = Number(tombol.dataset.index);

    if (tombol.dataset.aksi === "edit") {

        editBarang(index);

    }

});

// ======================================
// Event Delegation: Ceklist Baris
// ======================================

document.getElementById("tbodyBarang").addEventListener("change", function (e) {

    const chk = e.target.closest(".check-row-barang");

    if (!chk) return;

    const index = Number(chk.dataset.index);

    if (chk.checked) {

        barangTerpilih.add(index);

    } else {

        barangTerpilih.delete(index);

        const checkAllBarang = document.getElementById("checkAllBarang");

        if (checkAllBarang) checkAllBarang.checked = false;

    }

    updateTombolHapusTerpilihBarang();

});

// ======================================
// Ceklist "Pilih Semua"
// ======================================

const checkAllBarang = document.getElementById("checkAllBarang");

if (checkAllBarang) {

    checkAllBarang.addEventListener("change", function () {

        const semuaCheckbox = document.querySelectorAll("#tbodyBarang .check-row-barang");

        semuaCheckbox.forEach(function (cb) {

            cb.checked = checkAllBarang.checked;

            const index = Number(cb.dataset.index);

            if (checkAllBarang.checked) {

                barangTerpilih.add(index);

            } else {

                barangTerpilih.delete(index);

            }

        });

        updateTombolHapusTerpilihBarang();

    });

}

// ======================================
// Tambah Barang
// ======================================

async function tambahBarang() {

    const kode = document.getElementById("kodeBarang").value.trim();

    const nama = document.getElementById("namaBarang").value.trim();

    const satuan = document.getElementById("satuanBarang").value.trim();

    const stokAwal = Number(
        document.getElementById("stokAwalBarang").value
    );

    if (
        kode === "" ||
        nama === "" ||
        satuan === ""
    ) {

        gagal("Semua data wajib diisi. Kode tidak boleh kosong.");

        return;

    }

    if (isNaN(stokAwal)) {

        gagal("Stok Awal harus berupa angka.");

        return;

    }

    const duplikat = barang.some(item => item.kode.toLowerCase() === kode.toLowerCase());

    if (duplikat) {

        gagal("Kode barang sudah digunakan.");

        return;

    }

    // Harga barang dikelola di tab STOCK GUDANG, bukan di sini
    barang.push({

        kode,

        nama,

        satuan,

        stokAwal,

        harga: 0

    });

    await saveBarang(barang);

    renderBarang();

    if (typeof renderStock === "function") {
        renderStock();
    }
    clearBarangForm();
    sukses("Barang berhasil ditambahkan.");
}
// ======================================
// Edit Barang
// ======================================

function editBarang(index) {

    editIndexBarang = index;

    const item = barang[index];

    document.getElementById("kodeBarang").value = item.kode;

    document.getElementById("namaBarang").value = item.nama;

    document.getElementById("satuanBarang").value = item.satuan;

    document.getElementById("stokAwalBarang").value = item.stokAwal;

    document.getElementById("btnTambahBarang").innerHTML = `
        <i class="bi bi-check-circle"></i>
        UPDATE
    `;

}

// ======================================
// Update Barang
// ======================================

async function updateBarang() {

    if (editIndexBarang === -1) return;

    const kode = document.getElementById("kodeBarang").value.trim();

    const nama = document.getElementById("namaBarang").value.trim();

    const satuan = document.getElementById("satuanBarang").value.trim();

    const stokAwal = Number(
        document.getElementById("stokAwalBarang").value
    );

    if (
        kode === "" ||
        nama === "" ||
        satuan === ""
    ) {

        gagal("Semua data wajib diisi. Kode tidak boleh kosong.");

        return;

    }

    if (isNaN(stokAwal)) {

        gagal("Stok Awal harus berupa angka.");

        return;

    }

    const duplikat = barang.some((item, i) =>
        i !== editIndexBarang &&
        item.kode.toLowerCase() === kode.toLowerCase()
    );

    if (duplikat) {

        gagal("Kode barang sudah digunakan.");

        return;

    }

    // Harga barang lama tetap dipertahankan (dikelola di tab STOCK GUDANG)
    barang[editIndexBarang] = {

        kode,

        nama,

        satuan,

        stokAwal,

        harga: barang[editIndexBarang].harga || 0

    };

    await saveBarang(barang);

    renderBarang();

    if (typeof renderStock === "function") {
        renderStock();
    }

    clearBarangForm();

    editIndexBarang = -1;

    document.getElementById("btnTambahBarang").innerHTML = `
        <i class="bi bi-plus-circle"></i>
        TAMBAH
    `;

    sukses("Data berhasil diperbarui.");

}

// ======================================
// Hapus Barang Terpilih (Ceklist)
// Menggantikan tombol hapus (merah) per baris.
// ======================================

async function hapusBarangTerpilih() {

    if (barangTerpilih.size === 0) {

        gagal("Pilih data yang ingin dihapus terlebih dahulu (ceklist).");

        return;

    }

    const jumlah = barangTerpilih.size;

    if (!konfirmasi("Hapus " + jumlah + " data barang terpilih?")) return;

    // Urutkan dari index terbesar ke terkecil supaya splice tidak
    // menggeser posisi index lain yang belum diproses
    const indexTerurut = Array.from(barangTerpilih).sort((a, b) => b - a);

    indexTerurut.forEach(function (index) {

        barang.splice(index, 1);

    });

    barangTerpilih.clear();

    await saveBarang(barang);

    renderBarang();

    if (typeof renderStock === "function") {
        renderStock();
    }

    sukses(jumlah + " data barang berhasil dihapus.");

}

const btnHapusTerpilihBarang = document.getElementById("btnHapusTerpilihBarang");

if (btnHapusTerpilihBarang) {

    btnHapusTerpilihBarang.addEventListener("click", hapusBarangTerpilih);

}

// ======================================
// Bersihkan Form
// ======================================

function clearBarangForm() {

    document.getElementById("kodeBarang").value = "";

    document.getElementById("namaBarang").value = "";

    document.getElementById("satuanBarang").value = "";

    document.getElementById("stokAwalBarang").value = "";

}
// ======================================
// Pencarian Barang
// ======================================

const cariBarang = document.getElementById("cariBarang");

if (cariBarang) {

    cariBarang.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const hasil = barang.filter(item =>

            item.kode.toLowerCase().includes(keyword) ||

            item.nama.toLowerCase().includes(keyword) ||

            item.satuan.toLowerCase().includes(keyword)

        );

        renderBarang(hasil);

    });

}

// ======================================
// Event Tombol Tambah / Update
// ======================================

document.getElementById("btnTambahBarang").addEventListener("click", function () {

    if (editIndexBarang === -1) {

        tambahBarang();

    } else {

        updateBarang();

    }

});

// ======================================
// Import Excel
// ======================================

document.getElementById("btnImportBarang").addEventListener("click", function () {

    document.getElementById("importBarang").click();

});

// ======================================
// Export Excel
// ======================================

document.getElementById("btnExportBarang").addEventListener("click", function () {

    if (typeof exportBarangExcel === "function") {

        exportBarangExcel();

    }

});

// ======================================
// Submit Form Dengan Tombol Enter
// ======================================

["kodeBarang", "namaBarang", "satuanBarang", "stokAwalBarang"].forEach(function (id) {

    const input = document.getElementById(id);

    if (!input) return;

    input.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            document.getElementById("btnTambahBarang").click();

        }

    });

});

// ======================================
// Render Awal
// ======================================

renderBarang();

if (typeof renderStock === "function") {

    renderStock();

}
