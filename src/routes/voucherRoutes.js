const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllVouchers, createVoucher, updateVoucher, deleteVoucher } = require("../controllers/magiamgia/maGiamGiaController");
const { applyVoucher, removeVoucher } = require("../controllers/giohang/GioHangController");

router.get("/", getAllVouchers); // Khách & Admin đều xem được
router.post("/", protect, isAdmin, createVoucher);
router.put("/:id", protect, isAdmin, updateVoucher);
router.delete("/:id", protect, isAdmin, deleteVoucher);

router.post("/apply", protect, applyVoucher);
router.post("/remove", protect, removeVoucher);

module.exports = router;