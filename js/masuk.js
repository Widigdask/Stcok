/*
=========================================
MASUK.JS
CRUD Barang Masuk
=========================================
*/

let masuk = getMasuk();

let editIndexMasuk = -1;

// ======================================
// Ceklist / Pilih Baris (Pengganti Tombol Hapus Merah)
// Menyimpan index ASLI (posisi di array "masuk", bukan
// posisi di hasil pencarian) supaya tetap akurat walau
// tabel sedang difilter oleh pencarian.
// ======================================

let masukTerpilih = new Set();

function updateTombolHapusTerpilihMasuk() {

    const btn = document.getElementById("btnHapusTerpilihMasuk");

    if (!btn) return;

    const jumlah = masukTerpilih.size;

    btn.innerHTML = jumlah > 0
        ? `<i class="bi bi-trash3"></i> HAPUS TERPILIH (${jumlah})`
        : `<i class="bi bi-trash3"></i> HAPUS TERPILIH`;

}

// ======================================
// Render Tabel Barang Masuk
// ======================================

function renderMasuk(data = masuk) {

    const tbody = document.getElementById("tbodyMasuk");

    tbody.innerHTML = "";

    // Reset ceklist setiap kali tabel digambar ulang
    masukTerpilih.clear();

    const checkAllMasuk = document.getElementById("checkAllMasuk");

    if (checkAllMasuk) checkAllMasuk.checked = false;

    updateTombolHapusTerpilihMasuk();

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Belum ada data barang masuk.
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((item, i) => {

        // Index asli di array "masuk" (bukan index hasil filter pencarian)
        const realIndex = masuk.indexOf(item);

        tbody.innerHTML += `

        <tr>

            <td class="text-center">
                <input type="checkbox" class="form-check-input check-row-masuk" data-index="${realIndex}">
            </td>

            <td>${i + 1}</td>

            <td>${formatTanggal(item.tanggal)}</td>

            <td>${item.kode}</td>

            <td>${item.nama}</td>

            <td>${formatAngka(item.qty)}</td>

            <td>${item.keterangan || ""}</td>

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
// ======================================

document.getElementById("tbodyMasuk").addEventListener("click", function (e) {

    const tombol = e.target.closest("button[data-aksi]");

    if (!tombol) return;

    const index = Number(tombol.dataset.index);

    if (tombol.dataset.aksi === "edit") {

        editMasuk(index);

    }

});

// ======================================
// Event Delegation: Ceklist Baris
// ======================================

document.getElementById("tbodyMasuk").addEventListener("change", function (e) {

    const chk = e.target.closest(".check-row-masuk");

    if (!chk) return;

    const index = Number(chk.dataset.index);

    if (chk.checked) {

        masukTerpilih.add(index);

    } else {

        masukTerpilih.delete(index);

        const checkAllMasuk = document.getElementById("checkAllMasuk");

        if (checkAllMasuk) checkAllMasuk.checked = false;

    }

    updateTombolHapusTerpilihMasuk();

});

// ======================================
// Ceklist "Pilih Semua"
// ======================================

const checkAllMasuk = document.getElementById("checkAllMasuk");

if (checkAllMasuk) {

    checkAllMasuk.addEventListener("change", function () {

        const semuaCheckbox = document.querySelectorAll("#tbodyMasuk .check-row-masuk");

        semuaCheckbox.forEach(function (cb) {

            cb.checked = checkAllMasuk.checked;

            const index = Number(cb.dataset.index);

            if (checkAllMasuk.checked) {

                masukTerpilih.add(index);

            } else {

                masukTerpilih.delete(index);

            }

        });

        updateTombolHapusTerpilihMasuk();

    });

}

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
// Hapus Barang Masuk Terpilih (Ceklist)
// Menggantikan tombol hapus (merah) per baris.
// ======================================

async function hapusMasukTerpilih() {

    if (masukTerpilih.size === 0) {

        gagal("Pilih data yang ingin dihapus terlebih dahulu (ceklist).");

        return;

    }

    const jumlah = masukTerpilih.size;

    if (!konfirmasi("Hapus " + jumlah + " data barang masuk terpilih?")) return;

    // Urutkan dari index terbesar ke terkecil supaya splice tidak
    // menggeser posisi index lain yang belum diproses
    const indexTerurut = Array.from(masukTerpilih).sort((a, b) => b - a);

    indexTerurut.forEach(function (index) {

        masuk.splice(index, 1);

    });

    masukTerpilih.clear();

    await saveMasuk(masuk);

    renderMasuk();

    sukses(jumlah + " data barang masuk berhasil dihapus.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

const btnHapusTerpilihMasuk = document.getElementById("btnHapusTerpilihMasuk");

if (btnHapusTerpilihMasuk) {

    btnHapusTerpilihMasuk.addEventListener("click", hapusMasukTerpilih);

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
