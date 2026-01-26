const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllColors, createColor, updateColor, deleteColor } = require("../controllers/mausac/MauSacController");

// Route công khai cho khách xem màu sản phẩm
router.get("/", getAllColors);

// Các route yêu cầu quyền Admin
router.post("/", protect, isAdmin, createColor);
router.put("/:id", protect, isAdmin, updateColor);
router.delete("/:id", protect, isAdmin, deleteColor);

module.exports = router;