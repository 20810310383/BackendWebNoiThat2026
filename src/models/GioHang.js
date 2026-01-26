const mongoose = require("mongoose");

const gioHangSchema = new mongoose.Schema({
  nguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham', required: true },
  kichThuocDaChon: { type: String },
  mauSacDaChon: { type: String },
  soLuong: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("GioHang", gioHangSchema);