/*
=========================================
KELUAR.JS
CRUD Barang Keluar
Qty tidak boleh melebihi Stok Akhir
=========================================
*/

let keluar = getKeluar();

let editIndexKeluar = -1;

// ======================================
// Render Tabel Barang Keluar
// ======================================

function renderKeluar(data = keluar) {

    const tbody = document.getElementById("tbodyKeluar");

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Belum ada data barang keluar.
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

document.getElementById("tbodyKeluar").addEventListener("click", function (e) {

    const tombol = e.target.closest("button[data-aksi]");

    if (!tombol) return;

    const index = Number(tombol.dataset.index);

    if (tombol.dataset.aksi === "edit") {

        editKeluar(index);

    } else if (tombol.dataset.aksi === "hapus") {

        hapusKeluar(index);

    }

});

// ======================================
// Cek Ketersediaan Stok
// (Saat edit, qty lama dikembalikan dulu
// sebelum dibandingkan dengan qty baru)
// ======================================

function stokTersedia(kode, qtyLamaDiabaikan = 0) {

    if (typeof stokAkhirByKode !== "function") return Infinity;

    return stokAkhirByKode(kode) + qtyLamaDiabaikan;

}

// ======================================
// Auto-Isi Nama Barang Saat Kode Dipilih
// ======================================

const kodeKeluarSelect = document.getElementById("kodeKeluar");

if (kodeKeluarSelect) {

    kodeKeluarSelect.addEventListener("change", function () {

        const kode = this.value;

        const item = barang.find(b => b.kode === kode);

        document.getElementById("namaKeluar").value = item ? item.nama : "";

    });

}

// ======================================
// Tambah Barang Keluar
// ======================================

async function tambahKeluar() {

    const tanggal = document.getElementById("tanggalKeluar").value;

    const kode = document.getElementById("kodeKeluar").value.trim();

    const nama = document.getElementById("namaKeluar").value.trim();

    const qty = Number(
        document.getElementById("qtyKeluar").value
    );

    const keterangan = document.getElementById("keteranganKeluar").value.trim();

    if (tanggal === "" || kode === "" || nama === "") {

        gagal("Tanggal, Kode, dan Nama Barang wajib diisi.");

        return;

    }

    if (isNaN(qty) || qty <= 0) {

        gagal("Qty harus berupa angka lebih dari 0.");

        return;

    }

    const tersedia = stokTersedia(kode);

    if (qty > tersedia) {

        gagal("Qty melebihi Stok Akhir. Sisa stok tersedia: " + formatAngka(tersedia));

        return;

    }

    keluar.push({

        tanggal,

        kode,

        nama,

        qty,

        keterangan

    });

    await saveKeluar(keluar);

    renderKeluar();

    clearKeluarForm();

    sukses("Barang keluar berhasil ditambahkan.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

// ======================================
// Edit Barang Keluar
// ======================================

function editKeluar(index) {

    editIndexKeluar = index;

    const item = keluar[index];

    document.getElementById("tanggalKeluar").value = item.tanggal;

    document.getElementById("kodeKeluar").value = item.kode;

    document.getElementById("namaKeluar").value = item.nama;

    document.getElementById("qtyKeluar").value = item.qty;

    document.getElementById("keteranganKeluar").value = item.keterangan;

    document.getElementById("btnTambahKeluar").innerHTML = `
        <i class="bi bi-check-circle"></i>
        UPDATE
    `;

}

// ======================================
// Update Barang Keluar
// ======================================

function updateKeluar() {

    if (editIndexKeluar === -1) return;

    const tanggal = document.getElementById("tanggalKeluar").value;

    const kode = document.getElementById("kodeKeluar").value.trim();

    const nama = document.getElementById("namaKeluar").value.trim();

    const qty = Number(
        document.getElementById("qtyKeluar").value
    );

    const keterangan = document.getElementById("keteranganKeluar").value.trim();

    if (tanggal === "" || kode === "" || nama === "") {

        gagal("Tanggal, Kode, dan Nama Barang wajib diisi.");

        return;

    }

    if (isNaN(qty) || qty <= 0) {

        gagal("Qty harus berupa angka lebih dari 0.");

        return;

    }

    const qtyLama = keluar[editIndexKeluar].kode.toLowerCase() === kode.toLowerCase()
        ? Number(keluar[editIndexKeluar].qty)
        : 0;

    const tersedia = stokTersedia(kode, qtyLama);

    if (qty > tersedia) {

        gagal("Qty melebihi Stok Akhir. Sisa stok tersedia: " + formatAngka(tersedia));

        return;

    }

    keluar[editIndexKeluar] = {

        tanggal,

        kode,

        nama,

        qty,

        keterangan

    };

    await saveKeluar(keluar);

    renderKeluar();

    clearKeluarForm();

    editIndexKeluar = -1;

    document.getElementById("btnTambahKeluar").innerHTML = `
        <i class="bi bi-plus-circle"></i>
        TAMBAH
    `;

    sukses("Data barang keluar berhasil diperbarui.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

// ======================================
// Hapus Barang Keluar
// ======================================

function hapusKeluar(index) {

    if (!konfirmasi("Hapus data barang keluar ini?")) return;

    keluar.splice(index, 1);

    await saveKeluar(keluar);

    renderKeluar();

    sukses("Data barang keluar berhasil dihapus.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

// ======================================
// Bersihkan Form Barang Keluar
// ======================================

function clearKeluarForm() {

    document.getElementById("tanggalKeluar").value = "";

    document.getElementById("kodeKeluar").value = "";

    document.getElementById("namaKeluar").value = "";

    document.getElementById("qtyKeluar").value = "";

    document.getElementById("keteranganKeluar").value = "";

}

// ======================================
// Pencarian Barang Keluar
// ======================================

const cariKeluar = document.getElementById("cariKeluar");

if (cariKeluar) {

    cariKeluar.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const hasil = keluar.filter(item =>

            item.kode.toLowerCase().includes(keyword) ||

            item.nama.toLowerCase().includes(keyword) ||

            formatTanggal(item.tanggal).toLowerCase().includes(keyword)

        );

        renderKeluar(hasil);

    });

}

// ======================================
// Event Tombol Tambah / Update
// ======================================

document.getElementById("btnTambahKeluar").addEventListener("click", function () {

    if (editIndexKeluar === -1) {

        tambahKeluar();

    } else {

        updateKeluar();

    }

});

// ======================================
// Import Excel
// ======================================

document.getElementById("btnImportKeluar").addEventListener("click", function () {

    document.getElementById("importKeluar").click();

});

// ======================================
// Export Excel
// ======================================

document.getElementById("btnExportKeluar").addEventListener("click", function () {

    if (typeof exportKeluarExcel === "function") {

        exportKeluarExcel();

    }

});

// ======================================
// Submit Form Dengan Tombol Enter
// ======================================

["tanggalKeluar", "kodeKeluar", "namaKeluar", "qtyKeluar", "keteranganKeluar"].forEach(function (id) {

    const input = document.getElementById(id);

    if (!input) return;

    input.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            document.getElementById("btnTambahKeluar").click();

        }

    });

});

// ======================================
// Render Awal
// ======================================

renderKeluar();
