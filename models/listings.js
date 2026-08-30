
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let listingSchema = new Schema({
    title: {
        type: String,
    },

    description: {
        type: String,
    },

    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1758754169722-620d36fcb76b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0",
            set: (v) =>
                v === ""
                    ? "https://images.unsplash.com/photo-1758754169722-620d36fcb76b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0"
                    : v,
        },
    },

    price: {
        type: Number,
    },

    location: {
        type: String,
    },

    country: {
        type: String,
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;
