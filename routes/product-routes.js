const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products-controller");
const { check } = require("express-validator");
const checkAuth = require("../middlewares/authcheck");

router.get("/allproducts", productsController.getAllProducts);

router.get("/:pid", productsController.getProductById);

router.get("/user/:uid", productsController.getProductsByUserId);



router.use(checkAuth);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("price").not().isEmpty(),
  ],
  productsController.createProduct
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 }), check("price").isNumeric()],
  productsController.updateProductById
);

router.delete("/:pid", productsController.deleteProductById);

module.exports = router;
