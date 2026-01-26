const crypto = require("crypto");
const mongoose = require("mongoose");

const donHangSchema = new mongoose.Schema({
    maDonHang: { 
        type: String, 
        unique: true, 
        uppercase: true, 
        default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
    },

  nguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung', required: true },
  
  // Snapshot sản phẩm lúc mua
  chiTietDonHang: [{
    sanPhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham' },
    tenSanPham: String,
    anhDaiDien: String,
    kichThuoc: String,
    mauSac: String,
    giaLucMua: Number,
    soLuong: Number
  }],
  
  tongTienHang: { type: Number, required: true },
  phiVanChuyen: { type: Number, default: 0 },
  soTienGiamGia: { type: Number, default: 0 },
  tongThanhToan: { type: Number, required: true },
  
  thongTinNhanHang: {
    hoTen: String,
    soDienThoai: String,
    email: String,
    diaChi: String,
    ghiChu: String
  },
  
  trangThaiThanhToan: { 
    type: String, 
    enum: ['Chờ thanh toán', 'Đã thanh toán', 'Thất bại'], 
    default: 'Chờ thanh toán' 
  },
  trangThaiVanChuyen: { 
    type: String, 
    enum: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'], 
    default: 'Chờ xác nhận' 
  },
  phuongThucThanhToan: { type: String, default: 'COD' }
}, { timestamps: true });

module.exports = mongoose.model("DonHang", donHangSchema);