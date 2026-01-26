const Slider = require("../../models/Slider");

// 📌 Lấy danh sách slider (Public - cho khách hàng xem)
exports.getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find();
    res.status(200).json(sliders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách slider", error });
  }
};

// 📌 Thêm slider mới (Admin only)
exports.createSlider = async (req, res) => {
  try {   
    const newSlider = new Slider(req.body);
    await newSlider.save();
    res.status(201).json({ message: "Thêm slider thành công", data: newSlider });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo slider", error });
  }
};

// 📌 Cập nhật slider (Admin only)
exports.updateSlider = async (req, res) => {
  try {
    const updatedSlider = await Slider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSlider) return res.status(404).json({ message: "Không tìm thấy slider" });
    res.status(200).json({ message: "Cập nhật thành công", data: updatedSlider });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error });
  }
};

// 📌 Xóa slider (Admin only)
exports.deleteSlider = async (req, res) => {
  try {
    const deletedSlider = await Slider.findByIdAndDelete(req.params.id);
    if (!deletedSlider) return res.status(404).json({ message: "Không tìm thấy slider" });
    res.status(200).json({ message: "Đã xóa slider thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa slider", error });
  }
};