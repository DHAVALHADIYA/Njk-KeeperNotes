// here the schema of how to store notes is define
const mongoose = require("mongoose");

const noteschema = mongoose.Schema(
  {
    tokenkey: String,
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("note", noteschema);
