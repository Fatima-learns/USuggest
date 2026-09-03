const listing = require("../models/listings");
const Review = require("../models/reviews.js");

module.exports.createReview = async (req, res) => {
    let currentListing = await listing.findById(req.params.id);

    let review = new Review(req.body.review);
    review.author = req.user._id;

    await review.save();
    currentListing.reviews.push(review);
    await currentListing.save();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listing/${req.params.id}`);
};