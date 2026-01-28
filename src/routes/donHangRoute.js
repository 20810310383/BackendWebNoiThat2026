const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { taoDonHang, getDonHangCuaToi, getAllDonHang, updateTrangThaiDonHang, thanhToanOnlineSepay } = require("../controllers/donhang/DonHangController");

// Người dùng đặt hàng & xem đơn của mình
router.post("/", protect, taoDonHang);
router.get("/me", protect, getDonHangCuaToi);

// Admin quản lý
router.get("/admin/all", protect, isAdmin, getAllDonHang);
router.put("/admin/update/:id", protect, isAdmin, updateTrangThaiDonHang);

router.post("/thanh-toan-online", thanhToanOnlineSepay);

module.exports = router;