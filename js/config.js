/*
=========================================
CONFIG.JS
=========================================
*/

// ======================================
// URL Web App Google Apps Script
// (Isi setelah deploy Apps Script - lihat GOOGLE_SHEETS_SETUP.md)
// ======================================

const API_URL = "https://script.google.com/macros/s/AKfycbwkDq7_2GRRM2bhl4QDXAmLxbA0mWeQauo_uBKvW0fM32r6jPbqk6376UcwCxs0QQBu/exec";

const STORAGE_KEY = {

    BARANG: "sb_barang",

    MASUK: "sb_barang_masuk",

    KELUAR: "sb_barang_keluar"

};

const APP = {

    VERSION: "2.0.0",

    NAME: "APLIKASI STOCK BARANG"

};

const DEFAULT_DATA = {

    barang: [],

    masuk: [],

    keluar: []

};