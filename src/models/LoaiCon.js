const mongoose = require("mongoose");
const crypto = require("crypto");

const loaiConSchema = new mongoose.Schema({
  maLoaiCon: { 
    type: String, 
    unique: true, 
    uppercase: true, 
    default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
  },
  tenLoai: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  // Liên kết với Loại Cha
  idLoaiCha: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LoaiCha', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("LoaiCon", loaiConSchema);