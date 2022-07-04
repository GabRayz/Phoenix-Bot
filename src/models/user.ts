import mongoose from "mongoose";
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

const User = model("User", userSchema);

export default User;
