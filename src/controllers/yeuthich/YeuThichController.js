const YeuThich = require("../../models/YeuThich");

// 1. Toggle Yêu thích (Thêm nếu chưa có, Xóa nếu đã có)
exports.toggleYeuThich = async (req, res) => {
  try {
    const { sanPhamId } = req.body;
    const nguoiDungId = req.user._id; 

    // Kiểm tra xem bản ghi này đã tồn tại chưa
    const existing = await YeuThich.findOne({ 
      nguoiDung: nguoiDungId, 
      sanPham: sanPhamId 
    });

    if (existing) {
      // Đã thích rồi -> Xóa đi
      await YeuThich.deleteOne({ _id: existing._id });
      return res.status(200).json({ 
        success: true,
        message: "Đã xóa khỏi danh sách yêu thích", 
        isFavorite: false 
      });
    } else {
      // Chưa thích -> Lưu mới
      await YeuThich.create({
        nguoiDung: nguoiDungId,
        sanPham: sanPhamId
      });
      return res.status(201).json({ 
        success: true,
        message: "Đã thêm vào danh sách yêu thích", 
        isFavorite: true 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xử lý yêu thích", error: error.message });
  }
};

// 2. Lấy danh sách sản phẩm đã yêu thích của người dùng
exports.getDanhSachYeuThich = async (req, res) => {
  try {
    const nguoiDungId = req.user._id;
    
    const favorites = await YeuThich.find({ nguoiDung: nguoiDungId })
      .populate({
        path: 'sanPham',
        select: 'tieuDe anhDaiDien bienThe phanTramGiamGia',
        populate: { path: 'theLoai', select: 'tenTheLoai' }
      })
      .sort({ createdAt: -1 });

    const favoriteProducts = favorites
        .filter(item => item.sanPham) // Lọc bỏ nếu sản phẩm lỡ bị xóa khỏi DB
        .map(item => ({
            ...item.sanPham,
            isFavorite: true // Ép cứng là true để trái tim luôn đỏ ở trang Wishlist
        }));

    res.status(200).json(favoriteProducts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách yêu thích", error: error.message });
  }
};