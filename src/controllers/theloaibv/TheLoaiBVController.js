const TheLoaiBV = require("../../models/TheLoaiBV");

// 📌 Lấy danh sách TheLoaiBV (Public - cho khách hàng xem)
exports.getTheLoaiBVs = async (req, res) => {
  try {
    const TheLoaiBVs = await TheLoaiBV.find();
    res.status(200).json(TheLoaiBVs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách TheLoaiBV", error });
  }
};

// 📌 Thêm TheLoaiBV mới (Admin only)
exports.createTheLoaiBV = async (req, res) => {
  try {   
    const newTheLoaiBV = new TheLoaiBV(req.body);
    await newTheLoaiBV.save();
    res.status(201).json({ message: "Thêm loại bài viết thành công", data: newTheLoaiBV });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo TheLoaiBV", error });
  }
};

// 📌 Cập nhật TheLoaiBV (Admin only)
exports.updateTheLoaiBV = async (req, res) => {
  try {
    const updatedTheLoaiBV = await TheLoaiBV.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTheLoaiBV) return res.status(404).json({ message: "Không tìm thấy TheLoaiBV" });
    res.status(200).json({ message: "Cập nhật thành công", data: updatedTheLoaiBV });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error });
  }
};

// 📌 Xóa TheLoaiBV (Admin only)
exports.deleteTheLoaiBV = async (req, res) => {
  try {
    const deletedTheLoaiBV = await TheLoaiBV.findByIdAndDelete(req.params.id);
    if (!deletedTheLoaiBV) return res.status(404).json({ message: "Không tìm thấy TheLoaiBV" });
    res.status(200).json({ message: "Đã xóa loại bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa TheLoaiBV", error });
  }
};