const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getAllUsers, getUserById, createUser, updateUser, toggleUserActive, deleteUser } = require("../controllers/nguoidung/NguoiDungController");


router.get("/", protect, isAdmin, getAllUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.post("/", protect, isAdmin, createUser);
router.put("/:id", protect, isAdmin, updateUser);
router.put("/toggle-active/:id", protect, isAdmin, toggleUserActive);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;