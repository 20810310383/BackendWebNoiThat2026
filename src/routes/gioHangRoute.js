const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { themGioHang, getGioHangCuaToi, capNhatSoLuong, xoaItemGioHang, lamTranhGioHang } = require("../controllers/giohang/GioHangController");


router.post("/them", protect, themGioHang);
router.get("/cua-toi", protect, getGioHangCuaToi);
router.put("/cap-nhat/:id", protect, capNhatSoLuong);
router.delete("/xoa/:id", protect, xoaItemGioHang);
router.delete("/lam-trong", protect, lamTranhGioHang);

module.exports = router;