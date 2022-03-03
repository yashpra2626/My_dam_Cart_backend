const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Product = require("../models/product");
const User = require("../models/user");
const mongoose = require("mongoose");
//const mongooseUniqueValidator = require('mongoose-unique-validator');

const getProductById = async (req, res, next) => {
  const productId = req.params.pid;
  console.log(productId);
  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
  if (!product) {
    return next(new Error("Product does not exist for given Id"));
  }
  res.json({ product: product.toObject({ getters: true }) });
};

const getProductsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  let products;
  let user;
  try {
    user = await User.findById(userId).populate("products");
    products = user.products;
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
  if (!products) {
    return next(new Error("Product does not exist with given userId"));
  }
  res.json({
    product: products.map((product) => product.toObject({ getters: true })),
  });
};

const getAllProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find({},"-creatorId");
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
  if (!products) {
    return next(new Error("No Products can be fetched: Error occured "));
  }
  res.json({ product: products.map((product)=>(product.toObject({ getters: true }) ))});
};

const createProduct = async (req, res, next) => {
    console.log(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new Error("Invalid user input"));
  }
  const { title, description, price } = req.body;

  const imageFile = req.files.image;
  const ext = imageFile.name.split(".")[1];
  const filePath = `uploads/${uuidv4()}.${ext}`;
  imageFile.mv(filePath, (err) => {
    console.log("FILE UPLOAD ERROR", err);
    //next(new Error(err));
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
    if (!user) {
      return next(new Error("User does not exist for given Id"));
    }
  } catch (err) {
    return next(new Error(err));
  }

  const newProduct = new Product({
    title,
    description,
    price,
    creatorId:req.userData.userId,

    image: filePath,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await newProduct.save({ session: sess });
    user.products.push(newProduct);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
  res.json(newProduct);
};

const updateProductById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error("Invalid user input");
  }
  const productId = req.params.pid;
  const { title, description, price, image } = req.body;

  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    return next(new Error(err.message));
  }
  if (!product) {
    return next(new Error("Requested product does not exist"));
  }

  if (product.creatorId.toString() !== req.userData.userId) {
    return next(new Error("Not Authorized to Update"));
  }

  product.title = title;
  product.description = description;
  product.price = price;
  product.image = image;

  try {
    await product.save();
  } catch (error) {
    return next(new Error(error.message));
  }
  res.json({ product: product.toObject({ getters: true }) });
};

const deleteProductById = async (req, res, next) => {
  const productId = req.params.pid;
  let product;

  try {
    product = await Product.findById(productId).populate("creatorId");
    //product = user.product;
  } catch (err) {
    return next(new Error(err.message));
  }

  if (!product) {
    return res.json({ message: "Product does not exist" });
  }
  if (product.creatorId.id !== req.userData.userId) {
    return next(new Error("Not Authorized to Delete"));
  }

  const imagePath = product.image;
  const user = product.creatorId;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await product.remove({ session: sess });
    user.products.pull(product);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    return next(new Error(err.message));
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.json({ message: "Successfully delete the product" });
};

exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.getProductsByUserId = getProductsByUserId;
exports.createProduct = createProduct;
exports.updateProductById = updateProductById;
exports.deleteProductById = deleteProductById;
