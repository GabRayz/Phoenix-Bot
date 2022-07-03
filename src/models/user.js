const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const userSchema = new Schema(
    {
        _id: String,
        username: String,
        scores: [
            {
                game: String,
                score: Number,
            },
        ],
    },
    { _id: false }
);

module.exports = model("User", userSchema);
