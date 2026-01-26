const MaGiamGia = require("../../models/MaGiamGia");

// Lấy tất cả mã (Admin xem hết, Khách có thể lọc mã còn hạn)
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await MaGiamGia.find().sort({ createdAt: -1 });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách voucher", error });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const newVoucher = new MaGiamGia(req.body);
    await newVoucher.save();
    res.status(201).json({ message: "Tạo mã thành công", data: newVoucher });
  } catch (error) {
    res.status(400).json({ message: "Mã code đã tồn tại hoặc dữ liệu sai", error });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const updated = await MaGiamGia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    await MaGiamGia.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa mã giảm giá" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa mã", error });
  }
};