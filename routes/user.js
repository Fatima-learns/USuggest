const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

router.get("/signup" , (req,res) => {
    res.render("users/signup.ejs");
})

router.post("/signup" , wrapAsync(async (req,res) => {
    try{
        let {username,email,password} = req.body;
        const newUser = new User({username,email});
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome!");
            res.redirect("/listings");
        });
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));


router.get("/login" , (req,res) => {
    res.render("users/login.ejs");
})


router.post("/login" , saveRedirectUrl, passport.authenticate("local", {failureFlash:true, failureRedirect:"/login"}) ,
    async (req,res) => {
        req.flash("success" , "Welcome back!");
        res.redirect(res.locals.returnTo || "/listings");
    }
);

router.get("/logout", (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;