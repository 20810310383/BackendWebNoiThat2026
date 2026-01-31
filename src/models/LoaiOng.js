const mongoose = require("mongoose");
const crypto = require("crypto");

const loaiOngSchema = new mongoose.Schema({
  maLoaiOng: { 
    type: String, 
    unique: true, 
    uppercase: true, 
    default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
  },
  tenLoai: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  anhDaiDien: { type: String, default: null },
  moTaNgan: { type: String, trim: true },
  moTaDai: { type: String, trim: true },
  isShow: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("LoaiOng", loaiOngSchema);