const mongoose = require("mongoose");

const classImageSchema = new mongoose.Schema(
  {
    className: {
      type: String,
    },
    classImage: {
      type: String,
      required: [true],
    },
    classPublicUrl: {
      type: String,
      required: [true],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassImage", classImageSchema);
