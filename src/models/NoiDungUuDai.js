const mongoose = require("mongoose");

const NoiDungUuDaiSchema = new mongoose.Schema({ 
  NoiDungUuDai: { type: String, required: true }
});

module.exports = mongoose.model("NoiDungUuDai", NoiDungUuDaiSchema);