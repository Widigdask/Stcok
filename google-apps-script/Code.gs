/*
=========================================
CODE.GS
Backend Google Apps Script untuk
APLIKASI STOCK BARANG

Cara pakai: lihat file GOOGLE_SHEETS_SETUP.md
=========================================
*/

var SHEET_BARANG = "DATA BARANG";
var SHEET_MASUK = "BARANG MASUK";
var SHEET_KELUAR = "BARANG KELUAR";

var KOLOM_BARANG = ["kode", "nama", "satuan", "stokAwal", "harga"];
var KOLOM_TRANSAKSI = ["tanggal", "kode", "nama", "qty", "keterangan"];

// ======================================
// GET: Ambil Semua Data
// ======================================

function doGet(e) {

  var data = {
    barang: bacaSheet(SHEET_BARANG, KOLOM_BARANG),
    masuk: bacaSheet(SHEET_MASUK, KOLOM_TRANSAKSI),
    keluar: bacaSheet(SHEET_KELUAR, KOLOM_TRANSAKSI)
  };

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}

// ======================================
// POST: Simpan Data
// ======================================

function doPost(e) {

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {

    var action = e.parameter.action;
    if (
      action !== "simpanBarang" &&
      action !== "simpanMasuk" &&
      action !== "simpanKeluar"
    ) {

      return ContentService
          .createTextOutput(JSON.stringify({
              ok:false,
              pesan:"Action tidak dikenal"
          }))
          .setMimeType(ContentService.MimeType.JSON);

    }
    var data = [];

    try {
      data = JSON.parse(e.parameter.data || "[]");
    } catch (err) {
      data = [];
    }

    if (action === "simpanBarang") {

      tulisSheet(SHEET_BARANG, KOLOM_BARANG, data);

    } else if (action === "simpanMasuk") {

      tulisSheet(SHEET_MASUK, KOLOM_TRANSAKSI, data);

    } else if (action === "simpanKeluar") {

      tulisSheet(SHEET_KELUAR, KOLOM_TRANSAKSI, data);

    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {

    lock.releaseLock();

  }

}

// ======================================
// Helper: Baca Sheet Jadi Array Object
// ======================================

function bacaSheet(namaSheet, kolom) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(namaSheet);

  if (!sheet || sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, kolom.length).getValues();

  return values
    .filter(function (row) {
      return row.some(function (c) { return c !== "" && c !== null; });
    })
    .map(function (row) {
      var obj = {};
      kolom.forEach(function (k, i) { obj[k] = row[i]; });
      return obj;
    });

}

// ======================================
// Helper: Tulis Ulang Sheet Dari Array Object
// (Sheet dikosongkan lalu ditulis ulang semua,
// supaya sinkron persis dengan data terbaru dari aplikasi)
// ======================================

function tulisSheet(namaSheet, kolom, data) {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(namaSheet);

  if (!sheet) {
    sheet = ss.insertSheet(namaSheet);
  }

  if (sheet.getLastRow() > 1) {

    sheet.getRange(
        2,
        1,
        sheet.getLastRow()-1,
        kolom.length
    ).clearContent();

  }
  sheet.getRange(1, 1, 1, kolom.length).setValues([kolom]);

  if (Array.isArray(data) && data.length > 0) {

    var rows = data.map(function (item) {
      return kolom.map(function (k) {
        return item[k] !== undefined && item[k] !== null ? item[k] : "";
      });
    });

    sheet.getRange(2, 1, rows.length, kolom.length).setValues(rows);

  }

}
