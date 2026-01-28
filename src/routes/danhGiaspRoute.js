const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getDanhGiaSanPham, guiDanhGia, xoaDanhGia } = require("../controllers/danhgia/DanhGiaController");

// Công khai: Xem đánh giá
router.get("/san-pham/:sanPhamId", getDanhGiaSanPham);

// Cần đăng nhập: Gửi và Xóa
router.post("/gui", protect, guiDanhGia);
router.delete("/xoa/:id", protect, xoaDanhGia);

module.exports = router;