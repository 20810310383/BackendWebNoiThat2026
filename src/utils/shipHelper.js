const PhiGiaoHang = require("../models/PhiGiaoHang");


exports.tinhPhiShipTuDongLogic = async (tongTienHang) => {
  try {
    // 1. Lấy tất cả các cấu hình phí ship từ Database, sắp xếp theo điều kiện tăng dần
    const configs = await PhiGiaoHang.find().sort({ dieuKienFreeShip: 1 });

    if (!configs || configs.length === 0) {
      // Nếu chưa cấu hình gì, mặc định là 0 hoặc một con số an toàn
      return { phiShip: 0, tenMuc: "Giao hàng tiêu chuẩn", message: "" };
    }

    // 2. Tìm mức phí phù hợp nhất (Logic bậc thang)
    // Lọc các mức mà tongTienHang >= điều kiện áp dụng, sau đó lấy cái cao nhất
    let phuHop = configs
      .filter(c => tongTienHang >= (c.dieuKienFreeShip || 0))
      .sort((a, b) => (b.dieuKienFreeShip || 0) - (a.dieuKienFreeShip || 0))[0];

    // 3. Nếu đơn hàng quá thấp không khớp mức nào, lấy mức cơ bản nhất (thường là mức đầu tiên)
    if (!phuHop) {
      phuHop = configs[0];
    }

    return {
      phiShip: phuHop.phiShip,
      tenMuc: phuHop.tenKhuVuc, // Dùng field tenKhuVuc làm mô tả mức phí (Ví dụ: "Đơn hàng phổ thông")
      message: phuHop.phiShip === 0 ? "Ưu đãi: Miễn phí giao hàng" : `Phí vận chuyển: ${phuHop.phiShip.toLocaleString()}đ`
    };
  } catch (error) {
    console.error("Lỗi trong helper tính ship:", error);
    return { phiShip: 0, tenMuc: "Giao hàng", message: "Không thể tính phí ship" };
  }
};