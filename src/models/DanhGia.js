const mongoose = require("mongoose");

const danhGiaSPSchema = new mongoose.Schema({
  nguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham' },
  soSao: { type: Number, min: 1, max: 5 },
  noiDung: { type: String },
  anhDanhGia: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("DanhGia", danhGiaSPSchema);