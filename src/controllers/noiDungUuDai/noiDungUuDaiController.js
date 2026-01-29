const NoiDungUuDai = require("../../models/NoiDungUuDai");

// 1. Lấy tất cả nội dung ưu đãi
exports.getALlUuDai = async (req, res) => {
  try {
    const list = await NoiDungUuDai.find();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách ưu đãi", error });
  }
};

// 2. Thêm mới ưu đãi
exports.createUuDai = async (req, res) => {
  try {
    const newUuDai = new NoiDungUuDai({
      NoiDungUuDai: req.body.NoiDungUuDai
    });
    const saved = await newUuDai.save();
    res.status(201).json({ message: "Thêm ưu đãi thành công!", data: saved });
  } catch (error) {
    res.status(400).json({ message: "Không thể thêm ưu đãi", error });
  }
};

// 3. Cập nhật ưu đãi
exports.updateUuDai = async (req, res) => {
  try {
    const updated = await NoiDungUuDai.findByIdAndUpdate(
      req.params.id,
      { NoiDungUuDai: req.body.NoiDungUuDai },
      { new: true }
    );
    res.status(200).json({ message: "Cập nhật thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật", error });
  }
};

// 4. Xóa ưu đãi
exports.deleteUuDai = async (req, res) => {
  try {
    await NoiDungUuDai.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa ưu đãi thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi xóa", error });
  }
};