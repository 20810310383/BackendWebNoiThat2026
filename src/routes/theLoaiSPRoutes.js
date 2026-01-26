const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { createTheLoaiSP, updateTheLoaiSP, deleteTheLoaiSP, getTheLoaiSPs } = require("../controllers/loaisp/LoaiSPController");

// Route công khai
router.get("/", getTheLoaiSPs);

// Các route cần quyền Admin
router.post("/", protect, isAdmin, createTheLoaiSP);
router.put("/:id", protect, isAdmin, updateTheLoaiSP);
router.delete("/:id", protect, isAdmin, deleteTheLoaiSP);

module.exports = router;