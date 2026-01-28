const DanhGia = require("../../models/DanhGia");

// 1. Gửi đánh giá mới
exports.guiDanhGia = async (req, res) => {
  try {
    const { sanPhamId, soSao, noiDung } = req.body;
    const nguoiDungId = req.user._id;

    const moi = new DanhGia({
      nguoiDung: nguoiDungId,
      sanPham: sanPhamId,
      soSao,
      noiDung
    });

    await moi.save();
    
    // Trả về dữ liệu đã populate để update UI ngay lập tức
    const data = await DanhGia.findById(moi._id).populate("nguoiDung", "hoTen avatar");

    res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!", data });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi đánh giá", error: error.message });
  }
};

// 2. Lấy danh sách đánh giá của một sản phẩm
exports.getDanhGiaSanPham = async (req, res) => {
  try {
    const { sanPhamId } = req.params;
    const list = await DanhGia.find({ sanPham: sanPhamId })
      .populate("nguoiDung", "hoTen avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải đánh giá" });
  }
};

// 3. Xóa đánh giá (Admin hoặc Chính chủ)
exports.xoaDanhGia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const review = await DanhGia.findById(id);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    // Kiểm tra quyền: Admin HOẶC ID người dùng trùng với người đánh giá
    if (userRole === "admin" || review.nguoiDung.toString() === userId.toString()) {
      await DanhGia.findByIdAndDelete(id);
      return res.status(200).json({ message: "Đã xóa đánh giá thành công" });
    }

    res.status(403).json({ message: "Bạn không có quyền xóa đánh giá này" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đánh giá" });
  }
};