import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    subCategories: [{
        type: String,
        trim: true
    }]
});

export const Category = mongoose.model("Category", categorySchema);
