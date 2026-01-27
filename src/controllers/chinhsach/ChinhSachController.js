const ChinhSach = require("../../models/ChinhSach");

// 1. Lấy tất cả chính sách (hoặc lọc theo loại)
exports.getAllPolicies = async (req, res) => {
  try {
    const { loai } = req.query; // Có thể lọc qua ?loai=bao-hanh
    const filter = loai ? { loaiChinhSach: loai } : {};
    
    const policies = await ChinhSach.find(filter).sort({ createdAt: -1 });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách chính sách", error });
  }
};

// 2. Lấy chi tiết một chính sách theo ID hoặc Loại
exports.getPolicyBySlug = async (req, res) => {
  try {
    const policy = await ChinhSach.findOne({ loaiChinhSach: req.params.slug });
    if (!policy) return res.status(404).json({ message: "Không tìm thấy chính sách" });
    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 3. Thêm chính sách mới
exports.createPolicy = async (req, res) => {
  try {
    const newPolicy = new ChinhSach(req.body);
    await newPolicy.save();
    res.status(201).json({ message: "Thêm chính sách thành công", data: newPolicy });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo chính sách", error });
  }
};

// 4. Cập nhật chính sách
exports.updatePolicy = async (req, res) => {
  try {
    const updated = await ChinhSach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ message: "Cập nhật chính sách thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật chính sách", error });
  }
};

// 5. Xóa chính sách
exports.deletePolicy = async (req, res) => {
  try {
    await ChinhSach.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa chính sách" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa chính sách", error });
  }
};