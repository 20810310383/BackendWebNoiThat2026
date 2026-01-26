const mongoose = require("mongoose");

const chinhSachSchema = new mongoose.Schema({
  loaiChinhSach: { 
    type: String, 
    enum: ['mua_hang', 'doi_tra', 'van_chuyen'], 
    required: true 
  },
  tieuDe: { type: String, required: true },
  anhNen: String,
  moTa: String
});

module.exports = mongoose.model("ChinhSach", chinhSachSchema);