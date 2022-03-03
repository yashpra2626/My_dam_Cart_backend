const Cart = require("../models/cart");


const addItemToCart = (req, res) => {

    const userId = req.params.uid;

    Cart.findOne({ user: userId })
    .exec((error, cart) => {
        if(error) return res.status(400).json({ error });
        if(cart){
            //if cart already exists then update cart by quantity
            const product = req.body.cartItems.product;
            const item = cart.cartItems.find(c => c.product == product);

            if(item){
                item.quantity= item.quantity + req.body.cartItems.quantity;
                cart.save((error, cart) => {
                    if(error) return res.status(400).json({ error });
                    if(cart){
                        return res.status(201).json({ cart });
                    }
                });
                {/*Cart.findOneAndUpdate({ "user": userId, "cartItems.product": product }, {
                    "$set": {
                        "cartItems": {
                            ...cart.cartItems,
                            cart.cartItems[].quantity: item.quantity + req.body.cartItems.quantity
                        }
                    }
                })
                .exec((error, _cart) => {
                    if(error) return res.status(400).json({ error });
                    if(_cart){
                        return res.status(201).json({ cart: _cart });
                    }
                }) */}

            }else{
                
                Cart.findOneAndUpdate({ user: userId }, {
                    "$push": {
                        "cartItems": req.body.cartItems
                    }
                })
                .exec((error, _cart) => {
                    if(error) return res.status(400).json({ error });
                    if(_cart){
                        return res.status(201).json({ cart: _cart });
                    }
                })
            }

            

            //res.status(200).json({ message: cart });
        }else{
            //if cart not exist then create a new cart
            const cart = new Cart({
                user: userId,
                cartItems: [req.body.cartItems]
            });
            cart.save((error, cart) => {
                if(error) return res.status(400).json({ error });
                if(cart){
                    return res.status(201).json({ cart });
                }
            });
        } 
    });
};

const getCartProductsByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    console.log('getCartByProductUserId userId=',userId);
    let cartProducts;
  try {
    cartProducts = await Cart.findById(userId).populate("cartItems");
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
  if (!cartProducts) {
    return next(new Error("Your Cart is Empty. Please add Items and do Shopping with Shopping CityKart."));
  }
  res.json({ cartProducts: cartProducts.toObject({ getters: true }) });
};

exports.addItemToCart = addItemToCart;
exports.getCartProductsByUserId = getCartProductsByUserId;