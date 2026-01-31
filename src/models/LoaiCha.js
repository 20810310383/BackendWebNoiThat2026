const mongoose = require("mongoose");
const crypto = require("crypto");

const loaiChaSchema = new mongoose.Schema({
  maLoaiCha: { 
    type: String, 
    unique: true, 
    uppercase: true, 
    default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
  },
  tenLoai: { type: String, required: true, trim: true },
  slug: { type: String, },
  // Liên kết với Loại Ông
  idLoaiOng: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LoaiOng', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("LoaiCha", loaiChaSchema);