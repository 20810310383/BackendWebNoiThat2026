const bcrypt = require("bcryptjs");
const NguoiDung = require("../../models/NguoiDung");

// 1. Lấy danh sách người dùng (Phân trang + Tìm kiếm + Lọc Role)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { hoTen: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { soDienThoai: { $regex: search, $options: "i" } },
        { maNguoiDung: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    const count = await NguoiDung.countDocuments(query);
    const users = await NguoiDung.find(query)
      .select("-password -maOTP") // Bảo mật: Không trả về password và OTP
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalUsers: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
  }
};

// 2. Lấy chi tiết người dùng
exports.getUserById = async (req, res) => {
  try {
    const user = await NguoiDung.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 3. Tạo người dùng mới (Dành cho Admin tạo nhân viên)
exports.createUser = async (req, res) => {
  try {
    const { email, password, soDienThoai } = req.body;
    
    // Kiểm tra trùng lặp
    const existingUser = await NguoiDung.findOne({ $or: [{ email }, { soDienThoai }] });
    if (existingUser) return res.status(400).json({ message: "Email hoặc số điện thoại đã tồn tại" });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new NguoiDung({ ...req.body, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Tạo tài khoản thành công ✨", user: { email: newUser.email, role: newUser.role } });
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo tài khoản", error: error.message });
  }
};

// 4. Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { password } = req.body;
    const updateData = { ...req.body };

    // Nếu có đổi mật khẩu thì mã hóa lại
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updated = await NguoiDung.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    res.status(200).json({ message: "Cập nhật thành công", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error: error.message });
  }
};

// 5. Khóa/Mở khóa tài khoản (toggleActive)
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await NguoiDung.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ message: user.isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};

// 6. Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    await NguoiDung.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa người dùng vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa", error });
  }
};