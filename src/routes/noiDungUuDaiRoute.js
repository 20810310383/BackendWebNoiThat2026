const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getALlUuDai, createUuDai, updateUuDai, deleteUuDai } = require("../controllers/noiDungUuDai/noiDungUuDaiController");

// Route công khai: Ai cũng xem được ưu đãi
router.get("/", getALlUuDai);

// Route bảo mật: Chỉ Admin mới được Thêm/Sửa/Xóa (Nên thêm Middleware ở đây)
router.post("/create", protect, isAdmin, createUuDai);
router.put("/update/:id", protect, isAdmin, updateUuDai);
router.delete("/delete/:id", protect, isAdmin, deleteUuDai);

module.exports = router;