const express = require('express');
const cartController = require('../controllers/cart-controller');
const router = express.Router();

router.get('/:uid/loadCart', cartController.getCartProductsByUserId);

router.post('/:uid/addtocart', cartController.addItemToCart);


module.exports = router;