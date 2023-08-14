const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// here the schema define for user's information which is stored in db

const userschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate(email) {
        if (!validator.isEmail(email)) {
          throw new Error("This is not valid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    cpassword: String,
    tokenkey: String,
  },
  { timestamps: true }
);

// here hashing is done for secure password
userschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.cpassword = undefined;
  }
  next();
});

// for creating a jsonwebtoken for user due to authentication
userschema.methods.generatetokenkey = async function (key) {
  try {
    const tokenkey = jwt.sign(
      { key: key },
      "thisisjsonwebtokenforeachuserwillacessonlynotes"
    );
    this.tokenkey = tokenkey;
    await this.save();
    return tokenkey;
  } catch (err) {
    return err;
  }
};

module.exports = mongoose.model("user", userschema);
