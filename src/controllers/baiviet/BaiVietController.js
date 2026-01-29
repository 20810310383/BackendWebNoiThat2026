const BaiViet = require("../../models/BaiViet");
const TheLoaiBV = require("../../models/TheLoaiBV");

// 1. Lấy danh sách bài viết (Có phân trang & Tìm kiếm)
exports.getAllBaiViet = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", theLoai, isShow } = req.query;
    let query = {};

    // Tìm kiếm theo tiêu đề (không phân biệt hoa thường)
    if (search) {
      query.tieuDe = { $regex: search, $options: "i" };
    }

    // Lọc theo thể loại nếu có
    if (theLoai) {
        // Tìm xem maLoaiBV này ứng với _id nào
        const category = await TheLoaiBV.findOne({ maLoaiBV: theLoai.toUpperCase() });
        if (category) {
        query.theLoai = category._id; // Gán ID thực tế cho query
        } else {
        // Nếu mã không tồn tại, trả về rỗng luôn để không bị lỗi Cast
        return res.status(200).json({ data: [], totalPosts: 0 });
        }
    }

    // Lọc theo trạng thái hiển thị (dành cho client)
    if (isShow !== undefined) {
      query.isShow = isShow === "true";
    }

    const total = await BaiViet.countDocuments(query);
    const data = await BaiViet.find(query)
      .populate("theLoai") // Lấy tên thể loại
      .populate("tacGia", "hoTen avatar") // Lấy thông tin tác giả
      .sort({ createdAt: -1 }) // Bài mới nhất lên đầu
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalPosts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      posts: data,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách bài viết", error: error.message });
  }
};

// 2. Lấy chi tiết 1 bài viết
exports.getDetailBaiViet = async (req, res) => {
  try {
    const data = await BaiViet.findOne({ maBV: req.params.id })
      .populate("theLoai")
      .populate("tacGia", "hoTen avatar");
    if (!data) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết bài viết", error: error.message });
  }
};

// 3. Thêm bài viết mới
exports.createBaiViet = async (req, res) => {
  try {
    const newPost = new BaiViet({
      ...req.body,
      tacGia: req.user._id, // Lấy ID từ token người dùng đang đăng nhập
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo bài viết", error: error.message });
  }
};

// 4. Cập nhật bài viết
exports.updateBaiViet = async (req, res) => {
  try {
    const updatedPost = await BaiViet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật bài viết", error: error.message });
  }
};

// 5. Xóa bài viết
exports.deleteBaiViet = async (req, res) => {
  try {
    await BaiViet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa bài viết", error: error.message });
  }
};