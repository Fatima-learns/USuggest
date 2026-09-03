const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

// INDEX
router.get("/", wrapAsync(listingController.index));

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// CREATE
router.post(
    "/",
    isLoggedIn,
    upload.single("Listing[image]"),
    wrapAsync(listingController.createListing)
);

// EDIT
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));

// UPDATE
router.put(
    "/:id",
    isLoggedIn,
    upload.single("Listing[image]"),
    wrapAsync(listingController.updateListing)
);

// DELETE
router.delete("/:id", isLoggedIn, wrapAsync(listingController.destroyListing));

module.exports = router;