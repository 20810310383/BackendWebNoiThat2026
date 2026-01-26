const mongoose = require("mongoose");

const baiVietSchema = new mongoose.Schema({
  theLoai: { type: mongoose.Schema.Types.ObjectId, ref: 'TheLoaiBV' },
  tieuDe: { type: String, required: true },
  anhDaiDien: String,
  moTaNgan: String,
  noiDung: String,
  tacGia: { type: mongoose.Schema.Types.ObjectId, ref: 'NguoiDung' },
  isShow: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("BaiViet", baiVietSchema);