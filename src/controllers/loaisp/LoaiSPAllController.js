const LoaiOng = require("../../models/LoaiOng");
const LoaiCha = require("../../models/LoaiCha");
const LoaiCon = require("../../models/LoaiCon");
const slugify = require("slugify");
const SanPham = require("../../models/SanPham");

// --- UTILS: Hàm tạo slug chung ---
const createSlug = (text) => slugify(text, { lower: true, locale: 'vi' });

// ==========================================
// 1. QUẢN LÝ LOẠI ÔNG (Cấp 1)
// ==========================================
exports.createLoaiOng = async (req, res) => {
  try {
    const slug = createSlug(req.body.tenLoai);
    const data = await LoaiOng.create({ ...req.body, slug });
    res.status(201).json({ message: "Thêm thành công", data });
  } catch (error) { res.status(400).json({ error }); }
};

exports.getLoaiOngs = async (req, res) => {
  try {
    const data = await LoaiOng.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) { res.status(500).json(error); }
};

exports.updateLoaiOng = async (req, res) => {
  try {
    if (req.body.tenLoai) req.body.slug = createSlug(req.body.tenLoai);
    const data = await LoaiOng.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Cập nhật thành công", data });
  } catch (error) { res.status(400).json(error); }
};

exports.deleteLoaiOng = async (req, res) => {
  try {
    const hasCha = await LoaiCha.findOne({ idLoaiOng: req.params.id });
    if (hasCha) return res.status(400).json({ message: "Cần xóa các Loại con bên trong trước!" });
    await LoaiOng.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thành công" });
  } catch (error) { res.status(500).json(error); }
};

// ==========================================
// 2. QUẢN LÝ LOẠI CHA (Cấp 2)
// ==========================================
exports.createLoaiCha = async (req, res) => {
  try {
    const slug = createSlug(req.body.tenLoai);
    const data = await LoaiCha.create({ ...req.body, slug });
    res.status(201).json({ message: "Thêm thành công", data });
  } catch (error) { res.status(400).json(error); }
};

exports.getLoaiChasByOng = async (req, res) => {
  try {
    const data = await LoaiCha.find({ idLoaiOng: req.params.idOng }).populate("idLoaiOng");
    res.json(data);
  } catch (error) { res.status(500).json(error); }
};

exports.updateLoaiCha = async (req, res) => {
  try {
    if (req.body.tenLoai) req.body.slug = createSlug(req.body.tenLoai);
    const data = await LoaiCha.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Cập nhật thành công", data });
  } catch (error) { res.status(400).json(error); }
};
exports.deleteLoaiCha = async (req, res) => {
  try {
    const hasCon = await LoaiCon.findOne({ idLoaiCha: req.params.id });
    if (hasCon) return res.status(400).json({ message: "Cần xóa các Loại con bên trong trước!" });
    await LoaiCha.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thành công" });
  } catch (error) { res.status(500).json(error); }
};

// ==========================================
// 3. QUẢN LÝ LOẠI CON (Cấp 3)
// ==========================================
exports.createLoaiCon = async (req, res) => {
  try {
    const slug = createSlug(req.body.tenLoai);
    const data = await LoaiCon.create({ ...req.body, slug });
    res.status(201).json({ message: "Thêm thành công", data });
  } catch (error) { res.status(400).json(error); }
};

exports.getLoaiConsByCha = async (req, res) => {
  try {
    const data = await LoaiCon.find({ idLoaiCha: req.params.idCha }).populate("idLoaiCha");
    res.json(data);
  } catch (error) { res.status(500).json(error); }
};

exports.updateLoaiCon = async (req, res) => {
  try {
    if (req.body.tenLoai) req.body.slug = createSlug(req.body.tenLoai);
    const data = await LoaiCon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Cập nhật thành công", data });
  } catch (error) { res.status(400).json(error); }
};

exports.deleteLoaiCon = async (req, res) => {
  try {
    // Kiểm tra xem có sản phẩm nào đang dùng loại con này không trước khi xóa
    const hasProduct = await SanPham.findOne({ theLoaiCon: req.params.id });
    if (hasProduct) return res.status(400).json({ message: "Không thể xóa loại này vì đang có sản phẩm liên kết!" });
    
    await LoaiCon.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa thành công" });
  } catch (error) { res.status(500).json(error); }
};