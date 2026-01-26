const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
  anh: { type: String, required: true },
  tieuDeLon: String,
  tieuDeNho: String,
  url: String,
  note: String
});

module.exports = mongoose.model("Slider", sliderSchema);