const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllVouchers, createVoucher, updateVoucher, deleteVoucher } = require("../controllers/magiamgia/maGiamGiaController");

router.get("/", getAllVouchers); // Khách & Admin đều xem được
router.post("/", protect, isAdmin, createVoucher);
router.put("/:id", protect, isAdmin, updateVoucher);
router.delete("/:id", protect, isAdmin, deleteVoucher);

module.exports = router;