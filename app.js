require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const method = require("method-override");
const ejsmate = require("ejs-mate");
const port = process.env.PORT || 8080;
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const localStrategy = require("passport-local");
const wrapAsync = require("./utils/wrapAsync.js");
const User = require("./models/user.js");
const session = require("express-session");
const flash = require("connect-flash");


const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};


app.use(session(sessionOptions));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    next();
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.set("views", (path.join(__dirname, "views")));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const mongourl = process.env.ATLAS_URL;

app.use(method("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "public")));


const userRoutes = require("./routes/user.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");

app.use("/", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("error", err);
})

async function main() {
    await mongoose.connect(mongourl);
}

const listingController = require("./controllers/listing.js");
app.get("/listing/:id", wrapAsync(listingController.showListing));

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
    // res.status(statusCode).send(message);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});