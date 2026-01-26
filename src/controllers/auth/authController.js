const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../../utils/generateToken");
const NguoiDung = require("../../models/NguoiDung");

// 📌 Đăng ký tài khoản
exports.registerTK = async (req, res) => {
  try {
    const { email, soDienThoai, hoTen, password, diaChi } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra trùng email
    const existedEmail = await NguoiDung.findOne({ email });
    if (existedEmail) {
      return res.status(400).json({ message: "Có thể email này đã được đăng ký. Vui lòng chọn email khác!" });
    }

    // Kiểm tra trùng số điện thoại (nếu có)
    if (soDienThoai) {
      const existedPhone = await NguoiDung.findOne({ soDienThoai });
      if (existedPhone) {
        return res.status(400).json({ message: "Có thể Số điện thoại này đã được đăng ký. Vui lòng chọn Số điện thoại khác!" });
      }
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new NguoiDung({
      email,
      soDienThoai,
      hoTen,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        email: newUser.email,
        hoTen: newUser.hoTen,
        soDienThoai: newUser.soDienThoai,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📌 Đăng nhập
exports.loginTK = async (req, res) => {
  try {
    const { taiKhoan, password } = req.body;

    console.log("taiKhoan, password:",taiKhoan, password );
    

    // 1️⃣ Validate input
    if (!taiKhoan || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email/số điện thoại và mật khẩu",
      });
    }

    let user;

    // 2️⃣ Tìm user + lấy password
    if (typeof taiKhoan === "string" && taiKhoan.includes("@")) {
      user = await NguoiDung.findOne({ email: taiKhoan }).select("+password");
    } else {
      user = await NguoiDung.findOne({ soDienThoai: taiKhoan }).select("+password");
    }

    // 3️⃣ Check user tồn tại
    if (!user) {
      return res.status(404).json({
        message: "Sai email hoặc số điện thoại",
      });
    }

    // 4️⃣ Check active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản đang bị khóa. Liên hệ admin!",
      });
    }

    // 5️⃣ So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu không chính xác",
      });
    }

    // 6️⃣ Tạo token
    const token = generateToken(user);
    user.currentToken = token;
    await user.save();
    console.log("token: ",token);
    

    // 7️⃣ Trả response (KHÔNG trả password)
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        maNguoiDung: user.maNguoiDung,
        email: user.email,
        soDienThoai: user.soDienThoai,
        hoTen: user.hoTen,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



// 📌 Đăng xuất
exports.logoutTK = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    await NguoiDung.findByIdAndUpdate(decoded.id, { $unset: { currentToken: "" } });

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi đăng xuất", error: error.message });
  }
};


// 📌 Lấy thông tin user hiện tại (sau khi login)
exports.getMeTK = async (req, res) => {
  try {
    console.log("req.user từ token:", req.user); 
    console.log("User ID từ token:", req.user._id); // Kiểm tra user ID từ token

    const user = await NguoiDung.findById(req.user._id).select("-password"); // loại bỏ trường mật khẩu khi trả về
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.doiMatKhau = async (req, res) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    console.log("req.user._id: ",req.user._id);
    

    if (!matKhauCu || !matKhauMoi)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mật khẩu cũ hoặc mới" });

    const user = await NguoiDung.findById(req.user._id)
    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    // ✅ Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(matKhauCu, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu cũ không đúng" });

    // ✅ Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(matKhauMoi, salt);

    user.password = hashed;
    await user.save();

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.capNhatThongTin = async (req, res) => {
  try {
    const { hoTen, soDienThoai, avatar } = req.body;
    const user = await NguoiDung.findById(req.user._id);

    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    // ✅ Cập nhật các trường cho phép
    if (hoTen) user.hoTen = hoTen;
    if (soDienThoai) user.soDienThoai = soDienThoai;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({ success: true, message: "Cập nhật thông tin thành công", data: user });
  } catch (err) {
    console.error("Lỗi cập nhật thông tin:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
