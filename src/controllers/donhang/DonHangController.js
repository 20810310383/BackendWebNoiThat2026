const DonHang = require("../../models/DonHang");
const SanPham = require("../../models/SanPham");
const MaGiamGia = require("../../models/MaGiamGia");
const GioHang = require("../../models/GioHang");
const { tinhPhiShipTuDongLogic } = require("../../utils/shipHelper");
const SePayTransaction = require("../../models/SePayTransaction");
const { default: mongoose } = require("mongoose");

exports.taoDonHang = async (req, res) => {
  try {
    const { 
      cartItems, 
      thongTinNhanHang, 
      maVoucher, 
      phuongThucThanhToan 
    } = req.body;
    const nguoiDungId = req.user._id;

    let tongTienHang = 0;
    const chiTietDonHang = [];

    // 1. Kiểm tra tồn kho và tính tiền sản phẩm (Snapshot)
    for (const item of cartItems) {
      const sp = await SanPham.findById(item.sanPhamId);
      if (!sp) return res.status(404).json({ message: `Sản phẩm ${item.tenSanPham} không tồn tại` });

      const bienThe = sp.bienThe.find(bt => bt._id.toString() === item.bienTheId.toString());
      if (!bienThe || bienThe.khoHang < item.soLuong) {
        return res.status(400).json({ message: `Sản phẩm ${sp.tieuDe} - ${item.kichThuoc} đã hết hàng hoặc không đủ số lượng` });
      }

      const giaLucMua = Math.round(bienThe.giaBan * (1 - sp.phanTramGiamGia / 100));
      tongTienHang += giaLucMua * item.soLuong;

      chiTietDonHang.push({
        sanPhamId: sp._id,
        tenSanPham: sp.tieuDe,
        anhDaiDien: sp.anhDaiDien,
        kichThuoc: bienThe.kichThuoc,
        mauSac: item.mauSac,
        giaLucMua,
        soLuong: item.soLuong
      });
    }

    // 2. Tính phí ship tự động (Backend tính lại để bảo mật)
    const shipResult = await tinhPhiShipTuDongLogic(tongTienHang);
    const phiVanChuyen = shipResult.phiShip;

    // 3. Xử lý Voucher (Nếu có)
    let soTienGiamGia = 0;
    if (maVoucher) {
      const voucher = await MaGiamGia.findOne({ code: maVoucher.toUpperCase() });
      if (voucher && voucher.soLuongMa > 0 && tongTienHang >= voucher.dieuKienApDung) {
        soTienGiamGia = voucher.soTienGiam;
        // TRỪ LƯỢT VOUCHER
        await MaGiamGia.findByIdAndUpdate(voucher._id, { $inc: { soLuongMa: -1 } });
      }
    }

    // 4. Tạo đơn hàng mới
    const tongThanhToan = tongTienHang + phiVanChuyen - soTienGiamGia;
    const donHangMoi = new DonHang({
      nguoiDung: nguoiDungId,
      chiTietDonHang,
      tongTienHang,
      phiVanChuyen,
      soTienGiamGia,
      tongThanhToan,
      thongTinNhanHang,
      phuongThucThanhToan: phuongThucThanhToan || 'Chuyển khoản QR'
    });

    await donHangMoi.save();

    // 5. TRỪ KHO SẢN PHẨM & LÀM TRỐNG GIỎ HÀNG
    for (const item of cartItems) {
      await SanPham.updateOne(
        { _id: item.sanPhamId, "bienThe._id": item.bienTheId },
        { $inc: { "bienThe.$.khoHang": -item.soLuong, soLuongBan: item.soLuong } }
      );
    }
    await GioHang.deleteMany({ nguoiDung: nguoiDungId });

    res.status(201).json({ 
      message: "Đặt hàng thành công!", 
      maDonHang: donHangMoi.maDonHang,
      tongThanhToan: donHangMoi.tongThanhToan 
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo đơn hàng", error: error.message });
  }
};

// Lấy đơn hàng cá nhân
exports.getDonHangCuaToi = async (req, res) => {
  const data = await DonHang.find({ nguoiDung: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(data);
};

// Admin: Lấy toàn bộ đơn hàng (Kèm Tìm kiếm & Lọc)
exports.getAllDonHang = async (req, res) => {
  try {
    const { search, trangThaiThanhToan, trangThaiVanChuyen } = req.query;
    let query = {};

    // 1. Tìm kiếm theo Mã đơn, Tên hoặc Số điện thoại
    if (search) {
      query.$or = [
        { maDonHang: { $regex: search, $options: "i" } },
        { "thongTinNhanHang.hoTen": { $regex: search, $options: "i" } },
        { "thongTinNhanHang.soDienThoai": { $regex: search, $options: "i" } }
      ];
    }

    // 2. Lọc theo trạng thái thanh toán
    if (trangThaiThanhToan) {
      query.trangThaiThanhToan = trangThaiThanhToan;
    }

    // 3. Lọc theo trạng thái vận chuyển
    if (trangThaiVanChuyen) {
      query.trangThaiVanChuyen = trangThaiVanChuyen;
    }

    const data = await DonHang.find(query)
      .populate("nguoiDung", "hoTen email")
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng", error: error.message });
  }
};

// Admin: Cập nhật trạng thái
exports.updateTrangThaiDonHang = async (req, res) => {
  const { trangThaiVanChuyen, trangThaiThanhToan } = req.body;
  const update = await DonHang.findByIdAndUpdate(req.params.id, 
    { trangThaiVanChuyen, trangThaiThanhToan }, { new: true });
  res.status(200).json(update);
};

exports.thanhToanOnlineSepay = async (req, res) => {
  try {
    console.log("🔍 Raw body từ SePay:", JSON.stringify(req.body, null, 2));

    // ✅ Chuẩn bị dữ liệu từ SePay webhook
    const sePayWebhookData = {
      sepayId: req.body.id,
      gateway: req.body.gateway,
      transactionDate: new Date(req.body.transactionDate),
      accountNumber: req.body.accountNumber,
      subAccount: req.body.subAccount || "",
      code: req.body.code || "",
      content: req.body.content,
      transferType: req.body.transferType || "in",
      description: req.body.description || "",
      transferAmount: parseFloat(req.body.transferAmount),
      referenceCode: req.body.referenceCode || "",
      accumulated: parseInt(req.body.accumulated) || 0,
    };

    console.log("📝 Parsed data:", JSON.stringify(sePayWebhookData, null, 2));

    // ✅ Trích xuất mã đơn hàng từ nội dung
    const idOrder = sePayWebhookData.code.replace(/DH\s*/gi, "").trim();
   
    console.log("📦 Mã đơn hàng:", idOrder);
    console.log("💰 Số tiền:", sePayWebhookData.transferAmount);

    // 1️⃣ BẢO MẬT: Kiểm tra API Key từ SePay
    const authHeader = req.headers.authorization || "";
    const authorizationAPI = authHeader.replace("Apikey ", "").trim();
    
     console.log("📦 authorizationAPI:", authorizationAPI);
     console.log("📦 process.env.SEPAY_API_KEY:", process.env.SEPAY_API_KEY);

    if (authorizationAPI !== process.env.SEPAY_API_KEY) {
      console.error("❌ API Key không hợp lệ");
      return res.status(401).json({ message: "Unauthorized: Sai API Key" });
    }



    // 2️⃣ KIỂM TRA TRÙNG LẶP
    const existingTransaction = await SePayTransaction.findOne({ 
      sepayId: sePayWebhookData.sepayId 
    });

    console.log("==> ĐANG TÌM TRONG DB VỚI sepayId =", sePayWebhookData.sepayId);
    console.log("==> KẾT QUẢ TÌM:", existingTransaction);

    // if (existingTransaction) {
    //   console.log("⚠️ Giao dịch đã xử lý:", sePayWebhookData.sepayId);
    //   return res.status(200).json({ 
    //     message: "Giao dịch đã được xử lý trước đó",
    //     transactionId: existingTransaction._id 
    //   });
    // }

    // 3️⃣ TÌM ĐƠN HÀNG
    const order = await DonHang.findOne({ maDonHang: idOrder });

    if (!order) {
      // ✅ Lưu giao dịch thất bại để đối soát
      console.log("💾 Đang lưu transaction (không tìm thấy đơn)...");
      
      // ✅ THAY ĐỔI: Dùng insertMany thay vì create
      const failedTransactionResult = await SePayTransaction.collection.insertOne({
        sepayId: sePayWebhookData.sepayId,
        gateway: sePayWebhookData.gateway,
        transactionDate: sePayWebhookData.transactionDate,
        accountNumber: sePayWebhookData.accountNumber,
        subAccount: sePayWebhookData.subAccount,
        code: sePayWebhookData.code,
        content: sePayWebhookData.content,
        transferType: sePayWebhookData.transferType,
        description: sePayWebhookData.description,
        transferAmount: sePayWebhookData.transferAmount,
        referenceCode: sePayWebhookData.referenceCode,
        accumulated: sePayWebhookData.accumulated,
        orderId: idOrder,
        processedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Đã lưu transaction:", failedTransactionResult.insertedId);
      console.error("❌ Không tìm thấy đơn hàng:", idOrder);
      
      return res.status(200).json({
        success: false,
        message: "Đã lưu giao dịch nhưng không tìm thấy đơn hàng: " + idOrder,
        transactionId: failedTransactionResult.insertedId,
      });
    }

    // 4️⃣ KIỂM TRA SỐ TIỀN
    let trangThaiMoi = order.trangThaiThanhToan;
    const soTienThieu = order.tongThanhToan - sePayWebhookData.transferAmount;

    if (soTienThieu <= 0) {
      trangThaiMoi = "Đã thanh toán";
      console.log("✅ Thanh toán đủ/thừa:", Math.abs(soTienThieu));
    }  else {
      console.warn(`⚠️ Thanh toán thiếu: Cần ${order.tongThanhToan}, nhận ${sePayWebhookData.transferAmount}`);
    }

    // 5️⃣ LƯU GIAO DỊCH
    console.log("💾 Đang lưu transaction...");
    
    // ✅ THAY ĐỔI: Dùng insertOne thay vì create
    const newTransactionResult = await SePayTransaction.collection.insertOne({
      sepayId: sePayWebhookData.sepayId,
      gateway: sePayWebhookData.gateway,
      transactionDate: sePayWebhookData.transactionDate,
      accountNumber: sePayWebhookData.accountNumber,
      subAccount: sePayWebhookData.subAccount,
      code: sePayWebhookData.code,
      content: sePayWebhookData.content,
      transferType: sePayWebhookData.transferType,
      description: sePayWebhookData.description,
      transferAmount: sePayWebhookData.transferAmount,
      referenceCode: sePayWebhookData.referenceCode,
      accumulated: sePayWebhookData.accumulated,
      orderId: order.maDonHang,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const transactionId = newTransactionResult.insertedId;
    console.log("✅ Đã lưu transaction:", transactionId);

    // 6️⃣ CẬP NHẬT ĐƠN HÀNG
    console.log("📝 Đang cập nhật đơn hàng...");
    
    const updatedOrder = await DonHang.findOneAndUpdate(
      { maDonHang: idOrder },
      {
        $set: {
          trangThaiThanhToan: trangThaiMoi,
          phuongThucThanhToan: "Chuyển khoản",
        },
        $push: {
          transactionHistory: {
            date: new Date(),
            amount: sePayWebhookData.transferAmount,
            type: "deposit",
            reference: String(sePayWebhookData.referenceCode || sePayWebhookData.sepayId),
            gateway: sePayWebhookData.gateway,
            transactionId: transactionId,
          },
        },
      },
      { new: true }
    );

    console.log("✅ Xử lý thành công đơn hàng:", order.maDonHang);

    return res.status(200).json({
      success: true,
      data: {
        orderId: updatedOrder.maDonHang,
        trangThaiThanhToan: updatedOrder.trangThaiThanhToan,
        tongThanhToan: updatedOrder.tongThanhToan,
        soTienNhan: sePayWebhookData.transferAmount,
        transactionId: transactionId,
      },
      message: "Xử lý thanh toán thành công",
    });

  } catch (error) {
    console.error("❌ Lỗi SePay Webhook:", error);
    console.error("Stack trace:", error.stack);
    
    return res.status(500).json({ 
      success: false,
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// --- THỐNG KÊ CHO ADMIN ---
exports.getThongKeAdmin = async (req, res) => {
  try {
    const aggregate = await DonHang.aggregate([
      {
        $facet: {
          // 1. Tổng quan các con số
          "tongQuan": [
            {
              $group: {
                _id: null,
                tongDoanhThu: { $sum: "$tongThanhToan" },
                tongDonHang: { $sum: 1 },
                donThanhCong: {
                  $sum: { $cond: [{ $eq: ["$trangThaiThanhToan", "Đã thanh toán"] }, 1, 0] }
                }
              }
            }
          ],
          // 2. Doanh thu theo 7 ngày gần nhất
          "doanhThuTheoNgay": [
            {
                $match: {
                // Lấy từ 00:00:00 của 7 ngày trước theo giờ VN
                createdAt: { $gte: new Date(new Date().setHours(0,0,0,0) - 6 * 24 * 60 * 60 * 1000) },
                trangThaiThanhToan: "Đã thanh toán"
                }
            },
            {
                $group: {
                _id: { $dateToString: { format: "%d-%m", date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
                doanhThu: { $sum: "$tongThanhToan" } // Đặt tên là doanhThu (viết liền)
                }
            },
            { $sort: { "_id": 1 } }
            ],
          // 3. Tỉ lệ trạng thái đơn hàng (Pie Chart)
          "trangThaiDon": [
            {
              $group: {
                _id: "$trangThaiVanChuyen",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json(aggregate[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi thống kê admin", error: error.message });
  }
};

// --- THỐNG KÊ CHO KHÁCH HÀNG ---
exports.getThongKeKhachHang = async (req, res) => {
  try {
    const nguoiDungId = req.user._id;

    const stats = await mongoose.model("DonHang").aggregate([
      { $match: { nguoiDung: mongoose.Types.ObjectId(nguoiDungId) } },
      {
        $group: {
          _id: null,
          daChiTieu: {
            $sum: { $cond: [{ $eq: ["$trangThaiThanhToan", "Đã thanh toán"] }, "$tongThanhToan", 0] }
          },
          tongDonHang: { $sum: 1 },
          dangGiao: {
            $sum: { $cond: [{ $eq: ["$trangThaiVanChuyen", "Đang giao"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json(stats[0] || { daChiTieu: 0, tongDonHang: 0, dangGiao: 0 });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thống kê khách hàng", error: error.message });
  }
};