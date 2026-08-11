/*
=========================================
HELPER.JS
=========================================
*/

// ======================================
// Generate Nomor Urut
// ======================================

function generateNo(data) {
    return data.length + 1;
}

// ======================================
// Format Rupiah
// ======================================

function formatRupiah(angka) {

    angka = Number(angka) || 0;

    return "Rp " + angka.toLocaleString("id-ID");

}

// ======================================
// Format Angka
// ======================================

function formatAngka(angka) {

    angka = Number(angka) || 0;

    return angka.toLocaleString("id-ID");

}

// ======================================
// Format Tanggal
// ======================================

function formatTanggal(tanggal) {

    if (!tanggal) return "";

    const t = new Date(tanggal);

    return t.toLocaleDateString("id-ID", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric"

    });

}

// ======================================
// Kosongkan Form
// ======================================

function clearForm(idForm) {

    const form = document.getElementById(idForm);

    if (!form) return;

    form.reset();

}

// ======================================
// Alert Berhasil
// ======================================

function sukses(pesan) {

    alert("✅ " + pesan);

}

// ======================================
// Alert Error
// ======================================

function gagal(pesan) {

    alert("❌ " + pesan);

}

// ======================================
// Konfirmasi
// ======================================

function konfirmasi(pesan) {

    return confirm(pesan);

}

// ======================================
// Cari Data
// ======================================

function cariData(data, keyword) {

    keyword = keyword.toLowerCase();

    return data.filter(item =>
        JSON.stringify(item)
        .toLowerCase()
        .includes(keyword)
    );

}

// ======================================
// Download File JSON
// ======================================

function downloadJSON(namaFile, data) {

    const blob = new Blob(

        [JSON.stringify(data, null, 2)],

        { type: "application/json" }

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = namaFile;

    link.click();

}

// ======================================
// Upload JSON
// ======================================

function uploadJSON(file, callback) {

    const reader = new FileReader();

    reader.onload = function(e) {

        callback(JSON.parse(e.target.result));

    };

    reader.readAsText(file);

}