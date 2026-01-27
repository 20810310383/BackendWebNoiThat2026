const mongoose = require("mongoose");
const crypto = require("crypto");

const theLoaiSPSchema = new mongoose.Schema({
   maLoaiSanPham: { 
      type: String, 
      unique: true, 
      uppercase: true, 
      default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
    },
  tenTheLoai: { type: String, required: true, trim: true },
  anhDaiDien: { type: String, default: null },
  moTaNgan: { type: String, trim: true },
  moTaDai: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("TheLoaiSP", theLoaiSPSchema);