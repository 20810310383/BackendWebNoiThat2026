const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllBaiViet, getDetailBaiViet, createBaiViet, updateBaiViet, deleteBaiViet } = require("../controllers/baiviet/BaiVietController");

// PUBLIC ROUTES: Khách xem bài viết
router.get("/", getAllBaiViet);
router.get("/:id", getDetailBaiViet);

// PRIVATE ROUTES: Chỉ Admin mới được CRUD
router.post("/admin/add", protect, isAdmin, createBaiViet);
router.put("/admin/update/:id", protect, isAdmin, updateBaiViet);
router.delete("/admin/delete/:id", protect, isAdmin, deleteBaiViet);

module.exports = router;