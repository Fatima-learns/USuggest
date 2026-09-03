const listing = require("../models/listings");

module.exports.index = async (req, res) => {
    let allistings = await listing.find({});
    res.render("listings/index.ejs", { allistings });
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    let listings = await listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    });

    if (!listings) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
    let newlist = new listing(req.body.Listing);
    if (req.file) {
        newlist.image = { url: req.file.path, filename: req.file.filename };
    }
    newlist.owner = req.user._id;
    await newlist.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let oneList = await listing.findById(id);
    res.render("listings/edit.ejs", { oneList });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let updatedId = await listing.findByIdAndUpdate(id, { ...req.body.Listing });
    if (req.file) {
        updatedId.image = { url: req.file.path, filename: req.file.filename };
    }
    await updatedId.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedId = await listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};