const mongoose = require("mongoose");

const theLoaiBVSchema = new mongoose.Schema({
  tenTheLoai: { type: String, required: true }
});

module.exports = mongoose.model("TheLoaiBV", theLoaiBVSchema);