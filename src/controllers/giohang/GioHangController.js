const GioHang = require("../../models/GioHang");
const MaGiamGia = require("../../models/MaGiamGia");

// 1. THÊM VÀO GIỎ HÀNG
exports.themGioHang = async (req, res) => {
  try {
    const { sanPhamId, bienTheId, mauSac, soLuong } = req.body; // Nhận bienTheId
    const nguoiDungId = req.user._id;

    // 1. Kiểm tra xem sản phẩm này với đúng biến thể và màu sắc này đã có chưa
    let itemExist = await GioHang.findOne({
      nguoiDung: nguoiDungId,
      sanPham: sanPhamId,
      bienTheDaChon: bienTheId, // So khớp bằng ID biến thể
      mauSacDaChon: mauSac
    });

    if (itemExist) {
      itemExist.soLuong += (soLuong || 1);
      await itemExist.save();
      return res.status(200).json({ message: "Đã cập nhật số lượng", data: itemExist });
    }

    // 2. Nếu chưa có, tạo mới và lưu bienTheId
    const itemMoi = new GioHang({
      nguoiDung: nguoiDungId,
      sanPham: sanPhamId,
      bienTheDaChon: bienTheId, // Lưu ID để sau này truy xuất giá/tên chính xác
      mauSacDaChon: mauSac,
      soLuong: soLuong || 1
    });

    await itemMoi.save();
    res.status(201).json({ message: "Đã thêm vào giỏ hàng", data: itemMoi });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm giỏ hàng", error: error.message });
  }
};

// 2. LẤY DANH SÁCH GIỎ HÀNG CỦA TÔI
exports.getGioHangCuaToi = async (req, res) => {
  try {
    const data = await GioHang.find({ nguoiDung: req.user._id })
      .populate({
        path: "sanPham", // Populate sản phẩm
        populate: {
          path: "theLoai", // Tiếp tục populate Thể loại bên trong Sản phẩm
          select: "tenTheLoai maLoaiSanPham" // Chỉ lấy các trường cần thiết
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu giỏ hàng" });
  }
};

// 3. CẬP NHẬT SỐ LƯỢNG (Tăng/Giảm ở trang Giỏ hàng)
exports.capNhatSoLuong = async (req, res) => {
  try {
    const { id } = req.params;
    const { soLuong } = req.body;

    const updateItem = await GioHang.findOneAndUpdate(
      { _id: id, nguoiDung: req.user._id },
      { soLuong: soLuong },
      { new: true }
    );

    res.status(200).json({ message: "Đã cập nhật số lượng", data: updateItem });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật số lượng" });
  }
};

// 4. XÓA MỘT SẢN PHẨM KHỎI GIỎ
exports.xoaItemGioHang = async (req, res) => {
  try {
    await GioHang.findOneAndDelete({ _id: req.params.id, nguoiDung: req.user._id });
    res.status(200).json({ message: "Đã xóa khỏi giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa sản phẩm" });
  }
};

// 5. XÓA SẠCH GIỎ HÀNG (Sau khi đặt hàng xong)
exports.lamTranhGioHang = async (req, res) => {
  try {
    await GioHang.deleteMany({ nguoiDung: req.user._id });
    res.status(200).json({ message: "Giỏ hàng đã trống" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi làm trống giỏ hàng" });
  }
};

//  ÁP DỤNG VOUCHER
exports.applyVoucher = async (req, res) => {
  try {
    const { code, totalOrder } = req.body;

    const voucher = await MaGiamGia.findOne({ 
      code: code.toUpperCase(),
    });

    if (!voucher) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại!" });
    }

    // Kiểm tra hạn sử dụng
    if (voucher.hanSuDung && new Date(voucher.hanSuDung) < new Date()) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn!" });
    }

    // Kiểm tra số lượng mã
    if (voucher.soLuongMa <= 0) {
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng!" });
    }

    // Kiểm tra điều kiện đơn hàng tối thiểu
    if (totalOrder < voucher.dieuKienApDung) {
      return res.status(400).json({ 
        message: `Mã này chỉ áp dụng cho đơn hàng từ ${voucher.dieuKienApDung.toLocaleString()}đ` 
      });
    }

    res.status(200).json({
      message: "Áp dụng mã giảm giá thành công!",
      data: {
        code: voucher.code,
        soTienGiam: voucher.soTienGiam,
        voucherId: voucher._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra voucher" });
  }
};

// HUỶ VOUCHER (Thực tế chỉ là xóa state ở Frontend, 
// nhưng nếu bạn muốn log lại thì dùng hàm này)
exports.removeVoucher = async (req, res) => {
  res.status(200).json({ message: "Đã hủy áp dụng mã giảm giá" });
};