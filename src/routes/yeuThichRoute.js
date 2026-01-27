const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { toggleYeuThich, getDanhSachYeuThich } = require("../controllers/yeuthich/YeuThichController");

// Route Toggle Yêu thích (POST)
router.post("/toggle", protect, toggleYeuThich);

// Route lấy danh sách (GET)
router.get("/my-wishlist", protect, getDanhSachYeuThich);

module.exports = router;