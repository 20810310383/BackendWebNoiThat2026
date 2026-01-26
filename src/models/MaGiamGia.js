const mongoose = require("mongoose");

const maGiamGiaSchema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true },
  moTa: String,
  soTienGiam: { type: Number, required: true },
  dieuKienApDung: { type: Number, default: 0 }, // Tổng đơn tối thiểu
  soLuongMa: { type: Number, default: 0 },
  hanSuDung: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("MaGiamGia", maGiamGiaSchema);