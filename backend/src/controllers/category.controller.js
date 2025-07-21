import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";

export const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0) {
            throw new ApiError(404, "No categories found");
        }

        return res.status(200).json(
            new ApiResponse(200, categories, "Categories fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while fetching categories");
    }
});
