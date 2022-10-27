const { default: mongoose } = require("mongoose");
const { findById } = require("../models/product");
const Product = require("../models/product");
const Order = require("../models/order");

// controller

// get all product
/**
 * @route /product
 */ 
exports.getProduct = (req, res, next) => {
    // find is mongoose defined func
    Product.find()
        .then((results) => {
            console.log(results);
            res.render("shop/product-list.ejs", {
                products: results,
                docTitle: "shop",
                path: "/product",
                isLogged: req.session.isLoggedIn
            });
        })
        .catch((err) => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
            // console.log(err);
        });
};

// to get single product details
/**
 * @route /product-details/:productId 
 * @description to access the id of of mongodb object use _id
 */
exports.getProductDetails = (req, res, next) => {
    const id = req.params.productId;
    // findById is mongoose method
    Product.findById(id)
        .then((result) => {
            console.log("this is p");
        console.log(result);
            res.render('shop/product-detail', {
                product: result,
                docTitle: 'Product - Details',
                path: '/product/details',
                isLogged: req.session.isLoggedIn
            });
        })
        .catch((err) => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
        // console.log(err);
    });
};

  //@route-path /index
exports.getIndex = (req, res, next) => {
    console.log("GET  index");
    Product.find()
        .then((products) => {
            console.log(req.isLoggedIn);
            res.render("shop/index.ejs", {
                products: products,
                docTitle: "shop",
                path: "/",
                isLogged: req.session.isLoggedIn,
                csrfToken: req.csrfToken()
            });
        })
        .catch((err) => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
            // console.log(err);
        });
};

exports.getAddCart = (req, res, next) => {
    const id = req.params.id;

    Product.findById(id)
        .then(product => {
            return req.user.addToCart(product);
        })

        .then(product => {
            console.log(product);
            res.redirect("/cart");
        })
        .catch(err => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
            // console.log(err);
        });
};

exports.getCart = (req, res, next) => {
    //populate return promise
    req.user
        .populate('cart.items.productId')
        .then((user) => {
            if (user) {
                // console.log(Products.length);
                console.log("this is cart products ", user.cart.items);
                res.render("shop/cart.ejs", {
                    products: user.cart.items,
                    path: "/cart",
                    docTitle: "Cart",
                    isLogged: req.session.isLoggedIn
                });
            } else {
                console.log("no products");
            }
        })
        .catch(err => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
            // console.log(err);
        });
};

exports.getDeleteItemFromCart = (req, res, next) => {
    // const id = req.params.productId;
    const id = req.body.productId;
    console.log("to be deleted");
    req.user.deleteItemsFromCart(id)
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        })
        .catch(err => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
        // console.log(err);
    })

};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout.ejs", {
        docTitle: "Chekout",
        path: "/checkout",
        isLogged: req.session.isLoggedIn
    });
};

exports.getOrderDetails = (req, res, next) => {
    Order.find({'user.userId':req.user._id})
        .then((orders) => {
            // console.log("this is order ", orders[0].items[0].title);
            
            // console.log("lebght ", orders.length);
            // console.log("lebght ", orders[0].items.length);
            // for (let i = 0; i < orders.length; i++) {
            //     for (let j = 0; j < orders[i].items.length; j++) {
            //         console.log(orders[i].items[j].title);
            //     }
            // }
            
            res.render("shop/order.ejs", {
                orders: orders,
                docTitle: "order-Page",
                path: "/order",
                isLogged: req.session.isLoggedIn
            });
        })
        .catch(err => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
            // console.log(err);
        });
    
};
// add cart product to order
exports.getOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then((user) => {
            const products = user.cart.items.map(i => { return { quantity: i.quantity, product: { ...i.productId} } });
            console.log("this is order" ,products);
            const order = new Order({
                user: {userId: req.user._id, email:req.user.email },
                products:products
            });
            return order.save();
        }).then(() => {
            req.user.deleteAllItemsFromCart()
                .then(() => {
                    res.redirect('/cart');
                });
        })
        .catch(err => {
            const error = new Error("some error occured");
            error.httpStatuscode = 500;
            return next(error);
            // console.log( "this is err in get order   ", err);
        });
};