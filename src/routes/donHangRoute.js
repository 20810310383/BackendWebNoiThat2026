const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { taoDonHang, getDonHangCuaToi, getAllDonHang, updateTrangThaiDonHang, thanhToanOnlineSepay, getThongKeAdmin, getThongKeKhachHang, taoDonHangVangLai, getDonHangKoLogin } = require("../controllers/donhang/DonHangController");

// Người dùng đặt hàng & xem đơn của mình
router.post("/", protect, taoDonHang);
router.post("/dat-hang-nhanh", taoDonHangVangLai);
router.get("/me", protect, getDonHangCuaToi);
router.get("/me-kologin", getDonHangKoLogin);

// Admin quản lý
router.get("/admin/all", protect, isAdmin, getAllDonHang);
router.put("/admin/update/:id", protect, isAdmin, updateTrangThaiDonHang);

router.post("/thanh-toan-online", thanhToanOnlineSepay);

// Route cho Admin (Yêu cầu quyền Admin)
router.get("/admin/thong-ke", protect, isAdmin, getThongKeAdmin);

// Route cho Khách hàng (Chỉ xem đơn của mình)
router.get("/me/thong-ke", protect, getThongKeKhachHang);

module.exports = router;