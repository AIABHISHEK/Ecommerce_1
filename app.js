const config = require('dotenv').config();
const path = require('path');
const bodyparser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const csrf = require('csurf');
const flash = require('connect-flash');




const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');
const authRoute = require('./routes/auth');
const errorPage = require('./controller/error');

const User = require('./models/user');

const app = express();


const URL = process.env.MONGODB_URL;

const csrfProtection = csrf();

const store = new mongoStore({
    uri: URL,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');    // by default it is views

app.use(bodyparser.urlencoded({ extended: false }));

//it will do body parsing of the request
// app.use((req, res, next) => {  // middleware are function through which every request have to passed through before sending the response , they are filter



app.use(express.static(path.join(__dirname, 'public')));
//resave --false means will save session on every request until there is change
app.use(
    session(
        {
            secret: 'abhishek',
            resave: false, saveUninitialized: false,
            store:store  // store in mogo database session keys
        }
    )
);

// so after session initialization 
app.use(csrfProtection); // we need add csrf token in each view conyaining form that is that have post and also we need to pass csrf token to each req(for each rendering)
app.use(flash());


app.use('/', (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user == undefined) {
        next();
    }
    else {
        User.findById(req.session.user._id)
            .then((user) => {
                // make sure user exists and it is not undefined
                if (user) {
                    req.user = user;
                }
                return next();
            })
            .catch((err) => {
                throw new Error(err);
                // console.log(err);
            });
    }
});

//in inorder to send some data for every request use this
app.use((req, res, next) => {
    res.locals.isLogged = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.use(adminRoute);
// if we have common path before entering adminRoute we can use this app.use('/admin', adminRoute)
app.use(authRoute);


app.use(shopRoute);

app.get('/500', errorPage.get500Page);

// to send 404 page not found Error for unknown requests
app.use(errorPage.get404Page);

// const server = http.createServer(app);
// server.listen(3000);

// this error handling middleware is called when we pass error to next() as arg so express skips all middleware and calls error handling middleware
app.use((error, req, res, next) => {
    res.redirect('/500');
});

mongoose.connect(URL)
    .then((result) => {
        User.findOne()
            .then(user => {
                
            });
        app.listen(3000, () => {
            console.log('App listening on port 3000!');
        });
    })
    .catch(err => {
        console.log(err);
    });

// mongoConnect(() => {
//     app.listen(3000); // once connection established run the app
// });