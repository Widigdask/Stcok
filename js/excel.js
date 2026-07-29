
function ambilNilai(baris, ...kemungkinanHeader) {
    const keys = Object.keys(baris);
    for (const header of kemungkinanHeader) {
        const key = keys.find(
            k => k.toString().trim().toLowerCase() === header.toLowerCase()
        );
        if (key !== undefined) return baris[key];
    }
    return "";
}
function cariBarisHeader(rows, kataKunci) {
    let terbaikIndex = -1;
    let terbaikSkor = 0;
    const batas = Math.min(rows.length, 25);
    for (let i = 0; i < batas; i++) {
        const rowLower = rows[i].map(c => String(c).trim().toLowerCase());
        const skor = kataKunci.filter(k => rowLower.includes(k)).length;
        if (skor > terbaikSkor) {
            terbaikSkor = skor;
            terbaikIndex = i;
        }
    }
    return terbaikSkor > 0 ? terbaikIndex : -1;
}
function cariSheetTerbaik(workbook, kataKunciNama, kataKunciHeader) {
    let target = workbook.SheetNames.find(name =>
        kataKunciNama.some(k => name.toString().trim().toLowerCase().includes(k))
    );
    if (target) return target;
    for (const name of workbook.SheetNames) {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "" });
        if (cariBarisHeader(rows, kataKunciHeader) !== -1) return name;
    }
    return workbook.SheetNames[0];

}
function bacaExcel(file, opsi, callback) {
    if (typeof XLSX === "undefined") {
        gagal("Library SheetJS gagal dimuat. Periksa koneksi internet Anda lalu muat ulang halaman.");
        return;
    }
    const namaFile = file.name || "";
    const validExt = /\.(xlsx|xls)$/i.test(namaFile);
    if (!validExt) {
        gagal("Format file tidak didukung. Gunakan file .xlsx atau .xls.");
        return;
    }
    const kataKunciNama = (opsi && opsi.namaSheet) || [];
    const kataKunciHeader = (opsi && opsi.headerBaris) || [];
    const reader = new FileReader();
    reader.onerror = function () {
        gagal("Gagal membaca file. Pastikan file tidak rusak lalu coba lagi.");
    };
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            // cellDates: true supaya kolom TANGGAL terbaca sebagai tanggal asli
            const workbook = XLSX.read(data, { type: "array", cellDates: true });
            const namaSheet = cariSheetTerbaik(workbook, kataKunciNama, kataKunciHeader);
            const sheet = workbook.Sheets[namaSheet];
            // Ambil seluruh baris mentah (tanpa asumsi header ada di baris pertama)
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            const idxHeader = cariBarisHeader(rows, kataKunciHeader);
            if (idxHeader === -1) {
                gagal("Kolom (" + kataKunciHeader.join(", ") + ") tidak ditemukan pada file Excel. Pastikan nama kolom sesuai.");
                return;
            }
            const headers = rows[idxHeader].map(h => String(h).trim());
            const json = [];
            for (let i = idxHeader + 1; i < rows.length; i++) {
                const rowArr = rows[i];
                const adaIsi = rowArr.some(c => String(c).trim() !== "");
                if (!adaIsi) continue;
                const obj = {};
                headers.forEach((h, idx) => {
                    if (h) obj[h] = rowArr[idx] !== undefined ? rowArr[idx] : "";
                });
                json.push(obj);
            }
            if (json.length === 0) {
                gagal("File Excel kosong atau tidak memiliki data pada sheet \"" + namaSheet + "\".");
               return;
            }
            callback(json);
        } catch (err) {
            gagal("Gagal memproses file Excel: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}
function parseTanggalExcel(nilai) {
    if (!nilai) return "";
    if (nilai instanceof Date && !isNaN(nilai.getTime())) {
        return nilai.toISOString().slice(0, 10);
    }
    const coba = new Date(nilai);
    if (!isNaN(coba.getTime())) {
        return coba.toISOString().slice(0, 10);
    }
    return "";
}
function tulisExcel(data, namaSheet, namaFile) {
    if (typeof XLSX === "undefined") {
        gagal("Library SheetJS gagal dimuat. Periksa koneksi internet Anda lalu muat ulang halaman.");
        return;
    }
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, namaSheet);
        XLSX.writeFile(workbook, namaFile);
    } catch (err) {
        gagal("Gagal membuat file Excel: " + err.message);
    }
}
function exportBarangExcel() {
    const data = getBarang().map((item, index) => ({
        "NO": index + 1,
        "KODE": item.kode,
        "NAMA BARANG": item.nama,
        "SATUAN": item.satuan,
        "STOK AWAL": item.stokAwal
    }));
    if (data.length === 0) {
        gagal("Tidak ada data barang untuk diexport.");
        return;
    }
    tulisExcel(data, "Data Barang", "Data_Barang.xlsx");
    sukses("Data Barang berhasil diexport.");
}
async function importBarangExcel(file) {
    bacaExcel(file, {
        namaSheet: ["data barang", "barang"],
        headerBaris: ["kode", "nama barang", "satuan", "stok awal"]
    },async function (rows) {
        let jumlahBaru = 0;
        let dilewati = 0;
        rows.forEach(row => {
            const kode = String(ambilNilai(row, "KODE", "kode")).trim();
            const nama = String(ambilNilai(row, "NAMA BARANG", "nama")).trim();
            const satuan = String(ambilNilai(row, "SATUAN", "satuan")).trim();
            const stokAwal = Number(ambilNilai(row, "STOK AWAL", "stokAwal")) || 0;
            if (kode === "" || nama === "") {
                dilewati++;
                return;
            }
            const sudahAda = barang.some(
                item => item.kode.toLowerCase() === kode.toLowerCase()
            );
            if (sudahAda) {
                dilewati++;
                return;
            }
            barang.push({ kode, nama, satuan, stokAwal, harga: 0 });
            jumlahBaru++;
        });
        await saveBarang(barang);
        await muatSemuaData();
        renderBarang();
        if (typeof renderStock === "function") renderStock();
        if (jumlahBaru === 0) {
            gagal("Tidak ada data baru yang diimport. " + dilewati + " baris dilewati (kode kosong atau sudah ada).");
        } else if (dilewati > 0) {
            sukses(jumlahBaru + " data barang berhasil diimport (" + dilewati + " baris dilewati).");
        } else {
            sukses(jumlahBaru + " data barang berhasil diimport.");
        }
    });
}
function exportMasukExcel() {
    const data = getMasuk().map((item, index) => ({
        "NO": index + 1,
        "TANGGAL": formatTanggal(item.tanggal),
        "KODE": item.kode,
        "NAMA BARANG": item.nama,
        "QTY": item.qty,
        "KETERANGAN": item.keterangan
    }));
    if (data.length === 0) {
        gagal("Tidak ada data barang masuk untuk diexport.");
        return;
    }
    tulisExcel(data, "Barang Masuk", "Barang_Masuk.xlsx");
    sukses("Data Barang Masuk berhasil diexport.");
}
function importMasukExcel(file) {
    bacaExcel(file, {
        namaSheet: ["barang masuk", "masuk"],
        headerBaris: ["tanggal", "kode", "nama barang", "qty", "keterangan"]
    },async function (rows) {
        let jumlahBaru = 0;
        let dilewati = 0;
        rows.forEach(row => {
            const tanggalMentah = ambilNilai(row, "TANGGAL", "tanggal");
            const kode = String(ambilNilai(row, "KODE", "kode")).trim();
            const nama = String(ambilNilai(row, "NAMA BARANG", "nama")).trim();
            const qty = Number(ambilNilai(row, "QTY", "qty")) || 0;
            const keterangan = String(ambilNilai(row, "KETERANGAN", "keterangan")).trim();
            if (kode === "" || nama === "" || qty <= 0) {
                dilewati++;
                return;
            }
            // Tanggal mengikuti data pada file Excel yang diimport
            const tanggal = parseTanggalExcel(tanggalMentah) || new Date().toISOString().slice(0, 10);
            masuk.push({ tanggal, kode, nama, qty, keterangan });
            jumlahBaru++;
        });
        await saveMasuk(masuk);
        await muatSemuaData();
        renderMasuk();
        if (typeof renderStock === "function") renderStock();
        if (jumlahBaru === 0) {
            gagal("Tidak ada data baru yang diimport. " + dilewati + " baris dilewati (kode/nama kosong atau qty tidak valid).");
        } else if (dilewati > 0) {
            sukses(jumlahBaru + " data barang masuk berhasil diimport (" + dilewati + " baris dilewati).");
        } else {
            sukses(jumlahBaru + " data barang masuk berhasil diimport.");
        }
    });
}
// ==========================================================
// BARANG KELUAR
// ==========================================================
function exportKeluarExcel() {
    const data = getKeluar().map((item, index) => ({
        "NO": index + 1,
        "TANGGAL": formatTanggal(item.tanggal),
        "KODE": item.kode,
        "NAMA BARANG": item.nama,
        "QTY": item.qty,
        "KETERANGAN": item.keterangan
    }));
    if (data.length === 0) {
        gagal("Tidak ada data barang keluar untuk diexport.");
        return;
    }
    tulisExcel(data, "Barang Keluar", "Barang_Keluar.xlsx");
    sukses("Data Barang Keluar berhasil diexport.");
}
async function importKeluarExcel(file) {
    bacaExcel(file, {
        namaSheet: ["barang keluar", "keluar"],
        headerBaris: ["tanggal", "kode", "nama barang", "qty", "keterangan"]
    },async function (rows) {
        let jumlahBaru = 0;
        let ditolak = 0;
        let dilewati = 0;
        rows.forEach(row => {
            const tanggalMentah = ambilNilai(row, "TANGGAL", "tanggal");
            const kode = String(ambilNilai(row, "KODE", "kode")).trim();
            const nama = String(ambilNilai(row, "NAMA BARANG", "nama")).trim();
            const qty = Number(ambilNilai(row, "QTY", "qty")) || 0;
            const keterangan = String(ambilNilai(row, "KETERANGAN", "keterangan")).trim();
            if (kode === "" || nama === "" || qty <= 0) {
                dilewati++;
                return;
            }
            if (typeof stokAkhirByKode === "function" && qty > stokAkhirByKode(kode)) {
                ditolak++;
                return;
            }
            // Tanggal mengikuti data pada file Excel yang diimport
            const tanggal = parseTanggalExcel(tanggalMentah) || new Date().toISOString().slice(0, 10);
            keluar.push({ tanggal, kode, nama, qty, keterangan });
            jumlahBaru++;
        });
        await saveKeluar(keluar);
        await muatSemuaData();
        renderKeluar();
        if (typeof renderStock === "function") renderStock();
        if (ditolak > 0) {
            gagal(ditolak + " baris ditolak karena qty melebihi stok akhir.");
        }
        if (jumlahBaru === 0 && ditolak === 0) {
            gagal("Tidak ada data baru yang diimport. " + dilewati + " baris dilewati (kode/nama kosong atau qty tidak valid).");
        } else if (jumlahBaru > 0) {
            sukses(jumlahBaru + " data barang keluar berhasil diimport.");
        }
    });
}
// ==========================================================
// STOCK GUDANG (Export + Import)
// Total Masuk, Total Keluar, Stok Akhir tetap dihitung
// otomatis dari transaksi (tidak ikut diimport).
// Yang diimport di sini: KODE, NAMA BARANG, STOK AWAL,
// dan HARGA BARANG.
// - Jika KODE sudah ada di Data Barang -> NAMA BARANG,
//   STOK AWAL, dan HARGA BARANG diperbarui (kolom yang
//   kosong pada file Excel tidak akan menimpa data lama).
// - Jika KODE belum ada -> barang baru otomatis dibuat
//   (butuh minimal KODE dan NAMA BARANG pada file Excel).
// ==========================================================
function exportStockExcel() {
    const data = getStockData().map((item, index) => ({
        "NO": index + 1,
        "KODE": item.kode,
        "NAMA BARANG": item.nama,
        "SATUAN": item.satuan,
        "STOK AWAL": item.stokAwal,
        "TOTAL MASUK": item.totalMasuk,
        "TOTAL KELUAR": item.totalKeluar,
        "STOK AKHIR": item.stokAkhir,
        "HARGA BARANG": item.harga
    }));
    if (data.length === 0) {
        gagal("Tidak ada data stock untuk diexport.");
        return;
    }
    tulisExcel(data, "Stock Gudang", "Stock_Gudang.xlsx");
    sukses("Data Stock Gudang berhasil diexport.");
}
async function importStockExcel(file) {
    bacaExcel(file, {
        namaSheet: ["stok gudang", "stock gudang", "gudang"],
        headerBaris: ["kode", "harga barang", "nama barang", "stok awal"]
    },async function (rows) {
        let jumlahBaru = 0;
        let jumlahUpdate = 0;
        let dilewati = 0;
        rows.forEach(row => {
            const kode = String(ambilNilai(row, "KODE", "kode")).trim();
            if (kode === "") {
                dilewati++;
                return;
            }
            const namaMentah = String(ambilNilai(row, "NAMA BARANG", "nama")).trim();
            const satuanMentah = String(ambilNilai(row, "SATUAN", "satuan")).trim();
            const stokAwalMentah = ambilNilai(row, "STOK AWAL", "stokAwal");
            const hargaMentah = ambilNilai(row, "HARGA BARANG", "harga");

            const item = barang.find(
                b => b.kode.toLowerCase() === kode.toLowerCase()
            );

            if (item) {
                // Barang sudah ada: perbarui field yang memang diisi di Excel.
                // Kolom kosong dibiarkan, tidak menimpa data lama.
                if (namaMentah !== "") item.nama = namaMentah;
                if (satuanMentah !== "") item.satuan = satuanMentah;
                if (String(stokAwalMentah).trim() !== "") item.stokAwal = Number(stokAwalMentah) || 0;
                if (String(hargaMentah).trim() !== "") item.harga = Number(hargaMentah) || 0;
                jumlahUpdate++;
            } else if (namaMentah !== "") {
                // Barang belum ada di Data Barang: buat baru
                // (minimal butuh KODE + NAMA BARANG).
                barang.push({
                    kode,
                    nama: namaMentah,
                    satuan: satuanMentah || "-",
                    stokAwal: Number(stokAwalMentah) || 0,
                    harga: Number(hargaMentah) || 0
                });
                jumlahBaru++;
            } else {
                dilewati++;
            }
        });
        if (jumlahBaru > 0 || jumlahUpdate > 0) {
            await saveBarang(barang);
            await muatSemuaData();
            if (typeof renderBarang === "function") renderBarang();
            if (typeof renderStock === "function") renderStock();
        }
        if (jumlahBaru === 0 && jumlahUpdate === 0) {
            gagal("Tidak ada data yang diimport. " + dilewati + " baris dilewati (kode kosong atau nama barang tidak ada untuk kode baru).");
            return;
        }
        const pesan = [];
        if (jumlahBaru > 0) pesan.push(jumlahBaru + " barang baru ditambahkan");
        if (jumlahUpdate > 0) pesan.push(jumlahUpdate + " data diperbarui");
        sukses(pesan.join(", ") + (dilewati > 0 ? " (" + dilewati + " baris dilewati)" : "") + ".");
    });
}
// ==========================================================
// EVENT LISTENER: FILE INPUT (Import)
// ==========================================================
function pasangEventImport(idInput, fungsiImport) {
    const input = document.getElementById(idInput);
    if (!input) return;
    input.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        fungsiImport(file);
        e.target.value = "";
    });
}
pasangEventImport("importBarang", importBarangExcel);
pasangEventImport("importMasuk", importMasukExcel);
pasangEventImport("importKeluar", importKeluarExcel);
pasangEventImport("importStock", importStockExcel);
