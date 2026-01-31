const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const { getLoaiOngs, createLoaiOng, updateLoaiOng, deleteLoaiOng, getLoaiChasByOng, createLoaiCha, updateLoaiCha, getLoaiConsByCha, createLoaiCon, updateLoaiCon, deleteLoaiCon, deleteLoaiCha } = require("../controllers/loaisp/LoaiSPAllController");

// --- ROUTES LOẠI ÔNG ---
router.get("/ong", getLoaiOngs);
router.post("/ong", protect, isAdmin, createLoaiOng);
router.put("/ong/:id", protect, isAdmin, updateLoaiOng);
router.delete("/ong/:id", protect, isAdmin, deleteLoaiOng);

// --- ROUTES LOẠI CHA ---
router.get("/cha/:idOng", getLoaiChasByOng);
router.post("/cha", protect, isAdmin, createLoaiCha);
router.put("/cha/:id", protect, isAdmin, updateLoaiCha);
router.delete("/cha/:id", protect, isAdmin, deleteLoaiCha);

// --- ROUTES LOẠI CON ---
router.get("/con/:idCha", getLoaiConsByCha);
router.post("/con", protect, isAdmin, createLoaiCon);
router.put("/con/:id", protect, isAdmin, updateLoaiCon);
router.delete("/con/:id", protect, isAdmin, deleteLoaiCon);

module.exports = router;