const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { createSlider, updateSlider, deleteSlider, getSliders } = require("../controllers/slider/SliderController");

// Route công khai
router.get("/", getSliders);

// Các route cần quyền Admin
router.post("/", protect, isAdmin, createSlider);
router.put("/:id", protect, isAdmin, updateSlider);
router.delete("/:id", protect, isAdmin, deleteSlider);

module.exports = router;