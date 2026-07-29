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
// Ceklist / Pilih Baris (Pengganti Tombol Hapus Merah)
// Menyimpan index ASLI (posisi di array "keluar", bukan
// posisi di hasil pencarian) supaya tetap akurat walau
// tabel sedang difilter oleh pencarian.
// ======================================

let keluarTerpilih = new Set();

function updateTombolHapusTerpilihKeluar() {

    const btn = document.getElementById("btnHapusTerpilihKeluar");

    if (!btn) return;

    const jumlah = keluarTerpilih.size;

    btn.innerHTML = jumlah > 0
        ? `<i class="bi bi-trash3"></i> HAPUS TERPILIH (${jumlah})`
        : `<i class="bi bi-trash3"></i> HAPUS TERPILIH`;

}

// ======================================
// Render Tabel Barang Keluar
// ======================================

function renderKeluar(data = keluar) {

    const tbody = document.getElementById("tbodyKeluar");

    tbody.innerHTML = "";

    // Reset ceklist setiap kali tabel digambar ulang
    keluarTerpilih.clear();

    const checkAllKeluar = document.getElementById("checkAllKeluar");

    if (checkAllKeluar) checkAllKeluar.checked = false;

    updateTombolHapusTerpilihKeluar();

    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Belum ada data barang keluar.
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((item, i) => {

        // Index asli di array "keluar" (bukan index hasil filter pencarian)
        const realIndex = keluar.indexOf(item);

        tbody.innerHTML += `

        <tr>

            <td class="text-center">
                <input type="checkbox" class="form-check-input check-row-keluar" data-index="${realIndex}">
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

document.getElementById("tbodyKeluar").addEventListener("click", function (e) {

    const tombol = e.target.closest("button[data-aksi]");

    if (!tombol) return;

    const index = Number(tombol.dataset.index);

    if (tombol.dataset.aksi === "edit") {

        editKeluar(index);

    }

});

// ======================================
// Event Delegation: Ceklist Baris
// ======================================

document.getElementById("tbodyKeluar").addEventListener("change", function (e) {

    const chk = e.target.closest(".check-row-keluar");

    if (!chk) return;

    const index = Number(chk.dataset.index);

    if (chk.checked) {

        keluarTerpilih.add(index);

    } else {

        keluarTerpilih.delete(index);

        const checkAllKeluar = document.getElementById("checkAllKeluar");

        if (checkAllKeluar) checkAllKeluar.checked = false;

    }

    updateTombolHapusTerpilihKeluar();

});

// ======================================
// Ceklist "Pilih Semua"
// ======================================

const checkAllKeluar = document.getElementById("checkAllKeluar");

if (checkAllKeluar) {

    checkAllKeluar.addEventListener("change", function () {

        const semuaCheckbox = document.querySelectorAll("#tbodyKeluar .check-row-keluar");

        semuaCheckbox.forEach(function (cb) {

            cb.checked = checkAllKeluar.checked;

            const index = Number(cb.dataset.index);

            if (checkAllKeluar.checked) {

                keluarTerpilih.add(index);

            } else {

                keluarTerpilih.delete(index);

            }

        });

        updateTombolHapusTerpilihKeluar();

    });

}

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

async function updateKeluar() {

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
// Hapus Barang Keluar Terpilih (Ceklist)
// Menggantikan tombol hapus (merah) per baris.
// ======================================

async function hapusKeluarTerpilih() {

    if (keluarTerpilih.size === 0) {

        gagal("Pilih data yang ingin dihapus terlebih dahulu (ceklist).");

        return;

    }

    const jumlah = keluarTerpilih.size;

    if (!konfirmasi("Hapus " + jumlah + " data barang keluar terpilih?")) return;

    // Urutkan dari index terbesar ke terkecil supaya splice tidak
    // menggeser posisi index lain yang belum diproses
    const indexTerurut = Array.from(keluarTerpilih).sort((a, b) => b - a);

    indexTerurut.forEach(function (index) {

        keluar.splice(index, 1);

    });

    keluarTerpilih.clear();

    await saveKeluar(keluar);

    renderKeluar();

    sukses(jumlah + " data barang keluar berhasil dihapus.");

    if (typeof renderStock === "function") {

        renderStock();

    }

}

const btnHapusTerpilihKeluar = document.getElementById("btnHapusTerpilihKeluar");

if (btnHapusTerpilihKeluar) {

    btnHapusTerpilihKeluar.addEventListener("click", hapusKeluarTerpilih);

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
