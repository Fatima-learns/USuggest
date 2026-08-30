require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const listing = require("./models/listings");
const Review = require("./models/reviews.js");
const path = require("path");
const method = require("method-override");
const ejsmate = require("ejs-mate");
const port = process.env.PORT || 8080;
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const {isLoggedIn} = require("./middleware.js");
const multer = require('multer');
const { storage } = require('./cloudConfig.js');
const upload = multer({ storage });

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24  * 7,
        maxAge: 1000 * 60 * 60 * 24  * 7,
        httpOnly: true
    }
};


app.get('/', (req, res) => {
    res.redirect("/listings");
});

app.use(session(sessionOptions));

app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currUser = req.user;
    next();
});

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});




        
        app.set("views" ,(path.join(__dirname , "views")));
        app.set("view engine" , "ejs");
        
        app.use(express.urlencoded({extended :true}));
        
        const mongourl = process.env.ATLAS_URL;
        
        app.use(method("_method"));
        app.engine("ejs" ,ejsmate);
        app.use(express.static(path.join(__dirname, "public")));
        
        const userRoutes = require("./routes/user.js");
        app.use("/", userRoutes);

        
main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("error" , err);
})


async function main() {
    await mongoose.connect(mongourl);
}


// INDEX ROUTE
app.get("/listings" , wrapAsync(async (req,res) =>{
    let allistings = await listing.find({});
    res.render("listings/index.ejs" , ({allistings}));
}))


// SHOW ROUTE
app.get("/listing/:id" , wrapAsync(async (req,res) => {
    let {id} = req.params;

    let listings = await listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    });

    if(!listings){
        req.flash("error" , "Listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs" , ({listings}));
})
);

// NEW ROUTE
app.get("/listings/new" , isLoggedIn, (req,res) => {
    res.render("listings/new.ejs");
})

app.post("/listings" , isLoggedIn, upload.single('Listing[image]'), wrapAsync(async (req,res) => {

    let newlist = new listing(req.body.Listing);
    if (req.file) {
        newlist.image = { url: req.file.path, filename: req.file.filename };
    }
    newlist.owner = req.user._id;
    await newlist.save();
    req.flash("success" , "Listing created successfully!");
    res.redirect("/listings");
})
);



// EDIT ROUTE
app.get("/listings/:id/edit" , isLoggedIn, wrapAsync(async (req,res) => {
    let {id} = req.params;
    let oneList = await listing.findById(id);
    res.render("listings/edit.ejs" , ({oneList}));
})
);

// UPDATE ROUTE
app.put("/listings/:id" , isLoggedIn, upload.single('Listing[image]'), wrapAsync(async (req,res) => {
    let {id} = req.params;
    let updatedId = await listing.findByIdAndUpdate(id, {...req.body.Listing});
    if (req.file) {
        updatedId.image = { url: req.file.path, filename: req.file.filename };
    }
    await updatedId.save();
    req.flash("success" , "Listing updated successfully!");
    res.redirect(`/listing/${id}`);
})
);



// DELETE ROUTE
app.delete("/listings/:id", isLoggedIn, wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedId = await listing.findByIdAndDelete(id);
    req.flash("success" , "Listing deleted successfully!");
    res.redirect("/listings");
})
)

// Reviews
// Post Route
app.post("/listings/:id/reviews",  isLoggedIn,  async(req,res) => {
    let currentListing  = await listing.findById(req.params.id);

    let review = new Review(req.body.review);
    review.author = req.user._id;

    await review.save();
    await currentListing.reviews.push(review);
    await currentListing.save();
    
    // res.send("Review added successfully");
    res.redirect(`/listing/${req.params.id}`);
})



app.use((req,res,next) => {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err,req,res,next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs", { err });
    // res.status(statusCode).send(message);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});