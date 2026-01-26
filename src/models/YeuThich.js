const mongoose = require("mongoose");

const yeuThichSchema = new mongoose.Schema({
  nguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham' }
}, { timestamps: true });

module.exports = mongoose.model("YeuThich", yeuThichSchema);