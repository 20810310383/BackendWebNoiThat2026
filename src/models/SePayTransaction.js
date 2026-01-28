const mongoose = require("mongoose");

const sePayTransactionSchema = new mongoose.Schema(
  {
    sepayId: {
      type: Number,
      index: true,  // ✅ Tăng tốc độ query
    },
    gateway: {
      type: String,
      
    },
    transactionDate: {
      type: Date,
      
    },
    accountNumber: {
      type: String,
      
    },
    subAccount: {
      type: String,
    },
    code: {
      type: String,
    },
    content: {
      type: String,
      
      index: true, // ✅ Index để tìm kiếm theo nội dung (mã đơn hàng)
    },
    transferType: {
      type: String,
    },
    description: {
      type: String,
    },
    transferAmount: {
      type: Number,
      
    },
    referenceCode: {
      type: String,
    },
    accumulated: {
      type: Number,
    },
    // ✅ Thêm trường để tracking
    processedAt: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: String,
      index: true, // ✅ Link đến mã đơn hàng
    },
  },
  {
    timestamps: true, // ✅ Tự động thêm createdAt, updatedAt
  }
);

// ✅ Compound index cho query phức tạp
sePayTransactionSchema.index({ gateway: 1, transactionDate: -1 });
sePayTransactionSchema.index({ accountNumber: 1, transactionDate: -1 });

const SePayTransaction = mongoose.model("SePayTransaction", sePayTransactionSchema);

module.exports = SePayTransaction;