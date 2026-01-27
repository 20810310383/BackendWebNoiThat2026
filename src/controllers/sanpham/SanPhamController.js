const SanPham = require("../../models/SanPham");

// 1. Lấy danh sách sản phẩm (Phân trang + Tìm kiếm + Lọc)
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, theLoai, mauSac, minPrice, maxPrice, isShow } = req.query;
    
    // Xây dựng bộ lọc
    let query = {};
    if (search) {
      query.$or = [
        { tieuDe: { $regex: search, $options: "i" } },
        { maSanPham: { $regex: search, $options: "i" } }
      ];
    }
    if (theLoai) query.theLoai = theLoai;
    if (mauSac) query.mauSac = { $in: [mauSac] };
    if (isShow !== undefined) query.isShow = isShow;
    
    // Lọc theo giá (Dựa trên giá của biến thể đầu tiên)
    if (minPrice || maxPrice) {
      query["bienThe.0.giaBan"] = {};
      if (minPrice) query["bienThe.0.giaBan"].$gte = Number(minPrice);
      if (maxPrice) query["bienThe.0.giaBan"].$lte = Number(maxPrice);
    }

    const count = await SanPham.countDocuments(query);
    const products = await SanPham.find(query)
      .populate("theLoai")
      .populate("mauSac", "tenMauSac maMauSac")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error: error.message });
  }
};

// 2. Lấy chi tiết sản phẩm (Tự động tăng lượt xem)
exports.getProductById = async (req, res) => {
  try {
    const { code } = req.params; // Lấy mã từ URL
    
    const product = await SanPham.findOneAndUpdate(
      { maSanPham: code.toUpperCase() }, // Tìm theo mã (ép in hoa cho chuẩn)
      { $inc: { soLuotXem: 1 } },
      { new: true }
    ).populate("theLoai mauSac nguoiDang", "tenTheLoai tenMauSac maMauSac hoTen");
    
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm với mã này" });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tìm mã sản phẩm", error: error.message });
  }
};

// 3. Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new SanPham({ ...req.body, nguoiDang: req.user._id });
    await newProduct.save();
    res.status(201).json({ message: "Thêm sản phẩm thành công", data: newProduct });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo sản phẩm", error: error.message });
  }
};

// 4. Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updated = await SanPham.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error });
  }
};

// 5. Thay đổi trạng thái hiển thị (Ẩn/Hiện nhanh)
exports.toggleShowStatus = async (req, res) => {
  try {
    const product = await SanPham.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy" });
    
    product.isShow = !product.isShow;
    await product.save();
    res.status(200).json({ message: "Đã thay đổi trạng thái", isShow: product.isShow });
  } catch (error) {
    res.status(500).json({ message: "Lỗi", error });
  }
};

// 6. Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    await SanPham.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa", error });
  }
};