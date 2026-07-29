/*
=========================================
MASUK.JS
CRUD Barang Masuk
=========================================
*/

let masuk = getMasuk();

let editIndexMasuk = -1;

// ======================================
// Render Tabel Barang Masuk
// ======================================

function renderMasuk(data = masuk) {

    const tbody = document.getElementById("tbodyMasuk");

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Belum ada data barang masuk.
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((item, index) => {

        tbody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${formatTanggal(item.tanggal)}</td>

            <td>${item.kode}</td>

            <td>${item.nama}</td>

            <td>${formatAngka(item.qty)}</td>

            <td>${item.keterangan || ""}</td>

            <td>

                <button
                    class="btn btn-warning btn-sm"
                    data-aksi="edit"
                    data-index="${index}">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    data-aksi="hapus"
                    data-index="${index}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Event Delegation: Tombol Edit / Hapus
// ======================================

document.getElementById("tbodyMasuk").addEventListener("click", function (e) {

    const tombol = e.target.closest("button[data-aksi]");

    if (!tombol) return;

    const index = Number(tombol.dataset.index);

    if (tombol.dataset.aksi === "edit") {

        editMasuk(index);

    } else if (tombol.dataset.aksi === "hapus") {

        hapusMasuk(index);

    }

});

// ======================================
// Auto-Isi Nama Barang Saat Kode Dipilih
// ======================================

const kodeMasukSelect = document.getElementById("kodeMasuk");

if (kodeMasukSelect) {

    kodeMasukSelect.addEventListener("change", function () {

        const kode = this.value;

        const item = barang.find(b => b.kode === kode);

        document.getElementById("namaMasuk").value = item ? item.nama : "";

    });

}

// ======================================
// Tambah Barang Masuk
// ======================================

async function tambahMasuk() {

    const tanggal = document.getElementById("tanggalMasuk").value;

    const kode = document.getElementById("kodeMasuk").value.trim();

    const nama = document.getElementById("namaMasuk").value.trim();

    const qty = Number(
        document.getElementById("qtyMasuk").value
    );

    const keterangan = document.getElementById("keteranganMasuk").value.trim();

    if (tanggal === "" || kode === "" || nama === "") {

        gagal("Tanggal, Kode, dan Nama Barang wajib diisi.");

        return;

    }

    if (isNaN(qty) || qty <= 0) {

        gagal("Qty harus berupa angka lebih dari 0.");

        return;

    }

    masuk.push({

        tanggal,

        kode,

        nama,

        qty,

        keterangan

    });

    await saveMasuk(masuk);

    renderMasuk();

    clearMasukForm();

    sukses("Barang masuk berhasil ditambahkan.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

// ======================================
// Edit Barang Masuk
// ======================================

function editMasuk(index) {

    editIndexMasuk = index;

    const item = masuk[index];

    document.getElementById("tanggalMasuk").value = item.tanggal;

    document.getElementById("kodeMasuk").value = item.kode;

    document.getElementById("namaMasuk").value = item.nama;

    document.getElementById("qtyMasuk").value = item.qty;

    document.getElementById("keteranganMasuk").value = item.keterangan;

    document.getElementById("btnTambahMasuk").innerHTML = `
        <i class="bi bi-check-circle"></i>
        UPDATE
    `;

}

// ======================================
// Update Barang Masuk
// ======================================

async function updateMasuk() {

    if (editIndexMasuk === -1) return;

    const tanggal = document.getElementById("tanggalMasuk").value;

    const kode = document.getElementById("kodeMasuk").value.trim();

    const nama = document.getElementById("namaMasuk").value.trim();

    const qty = Number(
        document.getElementById("qtyMasuk").value
    );

    const keterangan = document.getElementById("keteranganMasuk").value.trim();

    if (tanggal === "" || kode === "" || nama === "") {

        gagal("Tanggal, Kode, dan Nama Barang wajib diisi.");

        return;

    }

    if (isNaN(qty) || qty <= 0) {

        gagal("Qty harus berupa angka lebih dari 0.");

        return;

    }

    masuk[editIndexMasuk] = {

        tanggal,

        kode,

        nama,

        qty,

        keterangan

    };

    await saveMasuk(masuk);

    renderMasuk();

    clearMasukForm();

    editIndexMasuk = -1;

    document.getElementById("btnTambahMasuk").innerHTML = `
        <i class="bi bi-plus-circle"></i>
        TAMBAH
    `;

    sukses("Data barang masuk berhasil diperbarui.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

// ======================================
// Hapus Barang Masuk
// ======================================

async function hapusMasuk(index) {

    if (!konfirmasi("Hapus data barang masuk ini?")) return;

    masuk.splice(index, 1);

    await saveMasuk(masuk);

    renderMasuk();

    sukses("Data barang masuk berhasil dihapus.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

// ======================================
// Bersihkan Form Barang Masuk
// ======================================

function clearMasukForm() {

    document.getElementById("tanggalMasuk").value = "";

    document.getElementById("kodeMasuk").value = "";

    document.getElementById("namaMasuk").value = "";

    document.getElementById("qtyMasuk").value = "";

    document.getElementById("keteranganMasuk").value = "";

}

// ======================================
// Pencarian Barang Masuk
// ======================================

const cariMasuk = document.getElementById("cariMasuk");

if (cariMasuk) {

    cariMasuk.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const hasil = masuk.filter(item =>

            item.kode.toLowerCase().includes(keyword) ||

            item.nama.toLowerCase().includes(keyword) ||

            formatTanggal(item.tanggal).toLowerCase().includes(keyword)

        );

        renderMasuk(hasil);

    });

}

// ======================================
// Event Tombol Tambah / Update
// ======================================

document.getElementById("btnTambahMasuk").addEventListener("click", function () {

    if (editIndexMasuk === -1) {

        tambahMasuk();

    } else {

        updateMasuk();

    }

});

// ======================================
// Import Excel
// ======================================

document.getElementById("btnImportMasuk").addEventListener("click", function () {

    document.getElementById("importMasuk").click();

});

// ======================================
// Export Excel
// ======================================

document.getElementById("btnExportMasuk").addEventListener("click", function () {

    if (typeof exportMasukExcel === "function") {

        exportMasukExcel();

    }

});

// ======================================
// Submit Form Dengan Tombol Enter
// ======================================

["tanggalMasuk", "kodeMasuk", "namaMasuk", "qtyMasuk", "keteranganMasuk"].forEach(function (id) {

    const input = document.getElementById(id);

    if (!input) return;

    input.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            document.getElementById("btnTambahMasuk").click();

        }

    });

});

// ======================================
// Render Awal
// ======================================

renderMasuk();
