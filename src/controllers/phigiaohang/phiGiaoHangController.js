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

exports.tinhPhiShipThucTe = async (req, res) => {
 try {
    const { tongTienHang } = req.body;

    // 1. Lấy tất cả cấu hình phí đang có
    const configs = await PhiGiaoHang.find().sort({ dieuKienFreeShip: 1 });

    if (configs.length === 0) {
      return res.status(200).json({ success: true, phiShip: 0 });
    }

    // 2. Tìm mức phí phù hợp (Logic quét bậc thang)
    // Tìm mức có dieuKienFreeShip lớn nhất nhưng vẫn <= tongTienHang
    let phuHop = configs
      .filter(c => tongTienHang >= (c.dieuKienFreeShip || 0))
      .sort((a, b) => (b.dieuKienFreeShip || 0) - (a.dieuKienFreeShip || 0))[0];

    // Nếu đơn hàng quá nhỏ không khớp mức nào, lấy mức có điều kiện thấp nhất
    if (!phuHop) {
      phuHop = configs[0];
    }

    res.status(200).json({
      success: true,
      phiShip: phuHop.phiShip,
      tenMuc: phuHop.tenKhuVuc, // Lúc này tenKhuVuc đóng vai trò là "Mô tả mức phí"
      message: phuHop.phiShip === 0 ? "Ưu đãi: Miễn phí vận chuyển" : `Phí vận chuyển: ${phuHop.phiShip.toLocaleString()}đ`
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tính phí ship tự động" });
  }
};