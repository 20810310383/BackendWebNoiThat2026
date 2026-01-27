const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllPolicies, getPolicyBySlug, createPolicy, updatePolicy, deletePolicy } = require("../controllers/chinhsach/ChinhSachController");
// Route công khai cho khách hàng đọc chính sách
router.get("/", getAllPolicies);
router.get("/detail/:slug", getPolicyBySlug);

// Các route quản trị
router.post("/", protect, isAdmin, createPolicy);
router.put("/:id", protect, isAdmin, updatePolicy);
router.delete("/:id", protect, isAdmin, deletePolicy);

module.exports = router;