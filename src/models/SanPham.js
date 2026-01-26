const mongoose = require("mongoose");
const crypto = require("crypto");


const bienTheSchema = new mongoose.Schema({
  kichThuoc: { type: String, required: true }, // VD: "1m2 x 2m"
  giaBan: { type: Number, required: true },
  khoHang: { type: Number, default: 0 }
});

const sanPhamSchema = new mongoose.Schema({
  maSanPham: { 
    type: String, 
    unique: true, 
    uppercase: true, 
    default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
  },
  tieuDe: { type: String, required: true, trim: true },
  anhDaiDien: { type: String, required: true },
  anhSlider: [{ type: String }], // Mảng nhiều ảnh
  theLoai: { type: mongoose.Schema.Types.ObjectId, ref: 'TheLoaiSP' },
  
  phanTramGiamGia: { type: Number, default: 0 },
  moTaNgan: { type: String, trim: true },
  moTaChiTiet: { type: String },
  
  // Màu sắc chọn nhiều
  mauSac: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MauSac' }], // VD: ["Gỗ Sồi", "Trắng", "Nâu"]
  
  // Biến thể kích thước kèm giá riêng
  bienThe: [bienTheSchema],
  
  soLuotXem: { type: Number, default: 0 },
  isShow: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("SanPham", sanPhamSchema);