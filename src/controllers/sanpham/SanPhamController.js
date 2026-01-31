const LoaiCha = require("../../models/LoaiCha");
const LoaiCon = require("../../models/LoaiCon");
const LoaiOng = require("../../models/LoaiOng");
const SanPham = require("../../models/SanPham");
const TheLoaiSP = require("../../models/TheLoaiSP");

// 1. Lấy danh sách sản phẩm (Phân trang + Tìm kiếm + Lọc)
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, theLoai, mauSac, minPrice, maxPrice, isShow, sort, 
      idLoaiOng,
      maLoaiOng,
      maLoaiCha,
      maLoaiCon
     } = req.query;

     console.log("maLoaiOng: ",maLoaiOng);
     console.log("maLoaiCha: ",maLoaiCha);
     console.log("maLoaiCon: ",maLoaiCon);
     
    
    // Xây dựng bộ lọc
    let query = {};
    let sortQuery = { createdAt: -1 }; // Mặc định: Mới nhất

    if (sort === "priceAsc") {
      sortQuery = { "bienThe.0.giaBan": 1 }; // Giá tăng dần
    } else if (sort === "priceDesc") {
      sortQuery = { "bienThe.0.giaBan": -1 }; // Giá giảm dần
    } else if (sort === "default") {
      sortQuery = { createdAt: -1 };
    }

    if (search) {
      query.$or = [
        { tieuDe: { $regex: search, $options: "i" } },
        { maSanPham: { $regex: search, $options: "i" } }
      ];
    }

    // 🌟 LOGIC LỌC THEO LOẠI ÔNG (CẤP 1)
    if (idLoaiOng) {
      // 1. Tìm tất cả các Loại Cha thuộc Loại Ông này
      const chas = await LoaiCha.find({ idLoaiOng })
      const chaIds = chas.map(c => c._id);

      // 2. Tìm tất cả các Loại Con thuộc danh sách Loại Cha vừa tìm được
      const cons = await LoaiCon.find({ idLoaiCha: { $in: chaIds } })
      const conIds = cons.map(c => c._id);

      // 3. Gán điều kiện lọc vào query sản phẩm
      // Tìm các sản phẩm có theLoaiCon nằm trong danh sách IDs cấp 3 này
      query.theLoaiCon = { $in: conIds };
    }

    // Logic lọc nâng cao theo mã loại
    if (maLoaiOng || maLoaiCha || maLoaiCon) {
      let targetConIds = [];

      if (maLoaiCon) {
        const con = await LoaiCon.findOne({ maLoaiCon })
        if (con) targetConIds = [con._id];
      } else if (maLoaiCha) {
        const cha = await LoaiCha.findOne({ maLoaiCha })
        if (cha) {
          const cons = await LoaiCon.find({ idLoaiCha: cha._id })
          targetConIds = cons.map(c => c._id);
        }
      } else if (maLoaiOng) {
        const ong = await LoaiOng.findOne({ maLoaiOng })
        if (ong) {
          const chas = await LoaiCha.find({ idLoaiOng: ong._id })
          const cons = await LoaiCon.find({ idLoaiCha: { $in: chas.map(c => c._id) } })
          targetConIds = cons.map(c => c._id);
        }
      }
      
      query.theLoaiCon = { $in: targetConIds };
    }

    // if (theLoai) {
    //   // Tìm xem maLoaiSanPham này ứng với _id nào
    //   const category = await TheLoaiSP.findOne({ maLoaiSanPham: theLoai.toUpperCase() });
    //   if (category) {
    //     query.theLoai = category._id; // Gán ID thực tế cho query
    //   } else {
    //     // Nếu mã không tồn tại, trả về rỗng luôn để không bị lỗi Cast
    //     return res.status(200).json({ products: [], totalProducts: 0 });
    //   }
    // }
    if (theLoai) {
        // 1. Tìm xem maLoaiOng này ứng với _id nào
        const ong = await LoaiOng.findOne({ maLoaiOng: theLoai.toUpperCase() });
        
        if (ong) {
            // 2. Tìm tất cả các Loại Cha thuộc Loại Ông này
            const chas = await LoaiCha.find({ idLoaiOng: ong._id });
            const chaIds = chas.map(c => c._id);

            // 3. Tìm tất cả các Loại Con thuộc danh sách Loại Cha vừa tìm được
            const cons = await LoaiCon.find({ idLoaiCha: { $in: chaIds } });
            const conIds = cons.map(c => c._id);

            // 4. Gán điều kiện lọc: Sản phẩm phải có theLoaiCon nằm trong danh sách ID cấp 3 này
            query.theLoaiCon = { $in: conIds };
        } else {
            // Nếu truyền mã Ông sai/không tồn tại, trả về rỗng luôn để tránh lấy nhầm toàn bộ SP
            return res.status(200).json({ products: [], totalProducts: 0 });
        }
    }
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
      .populate({
        path: 'theLoaiCon',
        populate: {
          path: 'idLoaiCha',
          populate: {
            path: 'idLoaiOng'
          }
        }
      })
      .sort(sortQuery)
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
    )
    .populate("theLoai mauSac nguoiDang", "tenTheLoai maLoaiSanPham tenMauSac maMauSac hoTen")
    .populate({
        path: 'theLoaiCon',
        populate: {
          path: 'idLoaiCha',
          populate: {
            path: 'idLoaiOng'
          }
        }
      })
    
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

exports.getRelatedProducts = async (req, res) => {
  try {
    const { maLoaiSP, currentMaSP } = req.params;

    // 1. Tìm ID của thể loại dựa trên maLoaiSP (ví dụ: A02BC)
    const theLoai = await LoaiCon.findOne({ maLoaiCon: maLoaiSP });
    
    if (!theLoai) {
      return res.status(404).json({ message: "Không tìm thấy danh mục này" });
    }

    // 2. Tìm các sản phẩm cùng thể loại nhưng bỏ qua sản phẩm đang xem
    const relatedProducts = await SanPham.find({
      theLoaiCon: theLoai._id,
      maSanPham: { $ne: currentMaSP }, // $ne = Not Equal (Không bao gồm SP hiện tại)
      isShow: true
    })
    // .select("tieuDe anhDaiDien phanTramGiamGia bienThe maSanPham") // Chỉ lấy field cần thiết
    // .limit(4) // Thường lấy 4 hoặc 8 sản phẩm để chia grid cho đẹp
    .populate("theLoai mauSac nguoiDang", "tenTheLoai maLoaiSanPham tenMauSac maMauSac hoTen")
    .populate({
        path: 'theLoaiCon',
        populate: {
          path: 'idLoaiCha',
          populate: {
            path: 'idLoaiOng'
          }
        }
      })
    .sort({ createdAt: -1 })
    .lean();


    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm liên quan", error: error.message });
  }
};