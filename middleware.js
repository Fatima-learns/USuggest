module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        if (req.method === "GET") {
            req.session.returnTo = req.originalUrl;
        } else {
            req.session.returnTo = req.get("Referrer") || "/listings";
        }

        req.flash("error", "You must be signed in!");

        return res.redirect("/login");
    }

    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
};