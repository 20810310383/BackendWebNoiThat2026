const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getShippingFees, createShippingFee, updateShippingFee, deleteShippingFee, tinhPhiShipThucTe } = require("../controllers/phigiaohang/phiGiaoHangController");

router.get("/", getShippingFees);
router.post("/", protect, isAdmin, createShippingFee);
router.put("/:id", protect, isAdmin, updateShippingFee);
router.delete("/:id", protect, isAdmin, deleteShippingFee);

router.post("/calculate", protect, tinhPhiShipThucTe);

module.exports = router;