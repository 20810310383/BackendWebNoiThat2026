const PhiGiaoHang = require("../../models/PhiGiaoHang");

exports.getShippingFees = async (req, res) => {
  try {
    const fees = await PhiGiaoHang.find();
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy phí ship", error });
  }
};

exports.createShippingFee = async (req, res) => {
  try {
    const newFee = new PhiGiaoHang(req.body);
    await newFee.save();
    res.status(201).json({ message: "Thêm khu vực vận chuyển thành công", data: newFee });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo phí ship", error });
  }
};

exports.updateShippingFee = async (req, res) => {
  try {
    const updated = await PhiGiaoHang.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật phí ship thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error });
  }
};

exports.deleteShippingFee = async (req, res) => {
  try {
    await PhiGiaoHang.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa khu vực này" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa phí ship", error });
  }
};