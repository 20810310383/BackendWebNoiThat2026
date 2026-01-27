const mongoose = require("mongoose");

const chinhSachSchema = new mongoose.Schema({
  loaiChinhSach: { 
    type: String, 
    required: true 
  },
  tieuDe: { type: String, required: true },
  moTa: String
});

module.exports = mongoose.model("ChinhSach", chinhSachSchema);