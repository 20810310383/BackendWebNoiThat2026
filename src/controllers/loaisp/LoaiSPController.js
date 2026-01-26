const TheLoaiSP = require("../../models/TheLoaiSP");

// 📌 Lấy danh sách TheLoaiSP (Public - cho khách hàng xem)
exports.getTheLoaiSPs = async (req, res) => {
  try {
    const TheLoaiSPs = await TheLoaiSP.find();
    res.status(200).json(TheLoaiSPs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách TheLoaiSP", error });
  }
};

// 📌 Thêm TheLoaiSP mới (Admin only)
exports.createTheLoaiSP = async (req, res) => {
  try {   
    const newTheLoaiSP = new TheLoaiSP(req.body);
    await newTheLoaiSP.save();
    res.status(201).json({ message: "Thêm loại sản phẩm thành công", data: newTheLoaiSP });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo TheLoaiSP", error });
  }
};

// 📌 Cập nhật TheLoaiSP (Admin only)
exports.updateTheLoaiSP = async (req, res) => {
  try {
    const updatedTheLoaiSP = await TheLoaiSP.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTheLoaiSP) return res.status(404).json({ message: "Không tìm thấy TheLoaiSP" });
    res.status(200).json({ message: "Cập nhật thành công", data: updatedTheLoaiSP });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error });
  }
};

// 📌 Xóa TheLoaiSP (Admin only)
exports.deleteTheLoaiSP = async (req, res) => {
  try {
    const deletedTheLoaiSP = await TheLoaiSP.findByIdAndDelete(req.params.id);
    if (!deletedTheLoaiSP) return res.status(404).json({ message: "Không tìm thấy TheLoaiSP" });
    res.status(200).json({ message: "Đã xóa loại sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa TheLoaiSP", error });
  }
};