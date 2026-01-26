const MauSac = require("../../models/MauSac");

// 1. Lấy tất cả màu sắc
exports.getAllColors = async (req, res) => {
  try {
    const colors = await MauSac.find().sort({ createdAt: -1 });
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách màu sắc", error });
  }
};

// 2. Thêm màu mới
exports.createColor = async (req, res) => {
  try {
    const { maMauSac, tenMauSac } = req.body;
    
    // Kiểm tra mã màu đã tồn tại chưa
    const existingColor = await MauSac.findOne({ maMauSac });
    if (existingColor) {
      return res.status(400).json({ message: "Mã màu này đã tồn tại" });
    }

    const newColor = new MauSac({ maMauSac, tenMauSac });
    await newColor.save();
    res.status(201).json({ message: "Thêm màu sắc thành công", data: newColor });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo màu sắc", error });
  }
};

// 3. Cập nhật màu sắc
exports.updateColor = async (req, res) => {
  try {
    const updated = await MauSac.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.status(200).json({ message: "Cập nhật thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật màu sắc", error });
  }
};

// 4. Xóa màu sắc
exports.deleteColor = async (req, res) => {
  try {
    await MauSac.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa màu sắc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa màu sắc", error });
  }
};