const mongoose = require("mongoose");
const crypto = require("crypto");

const nguoiDungSchema = new mongoose.Schema({
  maNguoiDung: { 
    type: String, 
    unique: true, 
    uppercase: true, 
    default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
  },
  hoTen: { type: String, trim: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  soDienThoai: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Xác thực và tương tác
  maOTP: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  currentToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("NguoiDung", nguoiDungSchema);