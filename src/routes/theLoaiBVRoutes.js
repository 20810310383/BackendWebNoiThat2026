const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { createTheLoaiBV, updateTheLoaiBV, deleteTheLoaiBV, getTheLoaiBVs } = require("../controllers/theloaibv/TheLoaiBVController");

// Route công khai
router.get("/", getTheLoaiBVs);

// Các route cần quyền Admin
router.post("/", protect, isAdmin, createTheLoaiBV);
router.put("/:id", protect, isAdmin, updateTheLoaiBV);
router.delete("/:id", protect, isAdmin, deleteTheLoaiBV);

module.exports = router;