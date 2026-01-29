const mongoose = require("mongoose");
const crypto = require("crypto");

const theLoaiBVSchema = new mongoose.Schema({
   maLoaiBV: { 
        type: String, 
        unique: true, 
        uppercase: true, 
        default: () => crypto.randomBytes(3).toString("hex").toUpperCase() 
      },
  tenTheLoai: { type: String, required: true }
});

module.exports = mongoose.model("TheLoaiBV", theLoaiBVSchema);