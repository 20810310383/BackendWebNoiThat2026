const mongoose = require("mongoose");

const yeuThichSchema = new mongoose.Schema({
  maMauSac: { type: String, },
  tenMauSac: { type: String, },
}, { timestamps: true });

module.exports = mongoose.model("MauSac", yeuThichSchema);