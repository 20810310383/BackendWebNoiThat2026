const mongoose = require("mongoose");

const phiGiaoHangSchema = new mongoose.Schema({
  tenKhuVuc: { type: String, required: true },
  phiShip: { type: Number, default: 0 },
  dieuKienFreeShip: { type: Number, default: null } // Đơn trên X đồng thì free
}, { timestamps: true });

module.exports = mongoose.model("PhiGiaoHang", phiGiaoHangSchema);