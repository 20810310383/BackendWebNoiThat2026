const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllProducts, getProductById, createProduct, updateProduct, toggleShowStatus, deleteProduct, getRelatedProducts } = require("../controllers/sanpham/SanPhamController");
// Public routes
router.get("/", getAllProducts);
router.get("/:code", getProductById);

// Admin routes
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.put("/toggle-status/:id", protect, isAdmin, toggleShowStatus); // Thay đổi trạng thái nhanh
router.delete("/:id", protect, isAdmin, deleteProduct);
router.get("/related/:maLoaiSP/:currentMaSP", getRelatedProducts);

module.exports = router;