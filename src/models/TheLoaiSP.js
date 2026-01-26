const mongoose = require("mongoose");

const theLoaiSPSchema = new mongoose.Schema({
  tenTheLoai: { type: String, required: true, trim: true },
  anhDaiDien: { type: String, default: null },
  moTaNgan: { type: String, trim: true },
  moTaDai: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("TheLoaiSP", theLoaiSPSchema);