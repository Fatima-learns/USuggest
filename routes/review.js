const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware.js");
const  wrapAsync = require("../utils/wrapAsync.js");

const reviewController = require("../controllers/review.js");

router.post(
    "/",
    isLoggedIn,
    wrapAsync(reviewController.createReview)
);

module.exports = router;