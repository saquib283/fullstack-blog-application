import { Blog } from "../models/blog.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Share } from "../models/shares.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { BlogImageUpload } from "../models/blogImageUpload.model.js";




export const createBlog = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "You must be logged in to create a blog.");
    }
    let {
        title,
        shortDescription,
        metaTitle,
        metaDescription,
        categoryID,
    } = req.body;

    let content;
    try {
        content = JSON.parse(req.body.content);
    } catch (e) {
        throw new ApiError(400, "Invalid content format. Content must be valid JSON.");
    }

    let tags = [];
    try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : [];
        if (!Array.isArray(tags)) {
            throw new Error("Tags must be an array.");
        }
    } catch (e) {
        throw new ApiError(400, "Invalid tags format. Tags must be a JSON array.");
    }

    let subCategories = [];
    try {
        subCategories = req.body.subCategories ? JSON.parse(req.body.subCategories) : [];
        if (!Array.isArray(subCategories)) {
            throw new Error("Subcategories must be an array.");
        }
    } catch (e) {
        throw new ApiError(400, "Invalid subCategories format. Subcategories must be a JSON array.");
    }


    if (!title?.trim()) {
        throw new ApiError(400, "Title is required.");
    }
    if (!content || !Array.isArray(content.blocks) || content.blocks.length === 0) {
        throw new ApiError(400, "Content must be a valid Editor.js output with at least one block.");
    }

    if (!shortDescription?.trim()) {
        throw new ApiError(400, "Short description is required.");
    }

    if (!categoryID) {
        throw new ApiError(400, "Category ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryID)) {
        throw new ApiError(400, "Invalid category ID format.");
    }

    const categoryDoc = await Category.findById(categoryID);
    if (!categoryDoc) {
        throw new ApiError(404, "Category not found.");
    }

    if (subCategories.length) {
        const normalize = (str) => String(str).trim().toLowerCase();
        const validSubs = new Set(categoryDoc.subCategories.map(sub => normalize(sub)));

        const invalidSubs = subCategories.filter(
            (sub) => !validSubs.has(normalize(sub))
        );

        if (invalidSubs.length > 0) {
            throw new ApiError(
                400,
                `Invalid subCategories for this category: ${invalidSubs.join(", ")}. Please select from available subcategories.`
            );
        }
    }
    const thumbnail_LOCAL_PATH = req.file?.path;
    if (!thumbnail_LOCAL_PATH) {
        throw new ApiError(400, "Thumbnail image file is required.");
    }

    let thumbnailImage;
    try {
        thumbnailImage = await uploadOnCloudinary(thumbnail_LOCAL_PATH);
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (error.name === 'TimeoutError') {
            throw new ApiError(504, "Thumbnail upload timed out. Try again with a smaller image.");
        }
        throw new ApiError(500, "Failed to upload thumbnail image. Please try again.");
    }

    if (!thumbnailImage || !thumbnailImage.url) {
        throw new ApiError(500, "Failed to get thumbnail URL after upload.");
    }

    const newBlog = new Blog({
        title,
        shortDescription,
        thumbnail: {
            url: thumbnailImage.url,
            alt: `${title}`,
            caption: `${title}`
        },
        content,
        metaTitle,
        metaDescription,
        author: user._id,
        tags,
        category: categoryID,
        subCategories,
    });

    try {
        const res = await newBlog.save();

        let blogImage = await BlogImageUpload.updateOne(
            { public_id: thumbnailImage.public_id },
            { $set: { used: true } }
        )
        if(blogImage.acknowledged){
            console.log("Used the picture....");
            
        }

    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new ApiError(400, `Validation Error: ${error}`);
        }
        console.error("Error saving new blog:", error);
        throw new ApiError(500, "Failed to create blog due to a database error.");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newBlog, "Blog created successfully!"));
});


export const getAllBlogs = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to view blogs.");
    }
    const blogs = await Blog.find()
        .populate("author", "fullname email username")
        .populate("category", "name")
        .populate({ // This is the correct way for nested population
            path: 'comments', // Target the 'comments' array in the Blog model
            // No 'select' here means all fields from the Comment document will be included
            populate: {       // Nested populate for the author within each comment
                path: 'user',   // Target the 'user' field in the Comment model (which references User)
              
            }
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs
    });
});



export const getBlogById = asyncHandler(async (req, res) => {
    const blogId = req.params.Id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        throw new ApiError(400, "Invalid blog ID.");
    }

    const blog = await Blog.findById(blogId)
        .populate("author", "fullname username email")
        .populate("category", "name subCategories")
        .populate("comment")
        .lean();

    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    res.status(200).json({
        success: true,
        blog
    });
});


// GET /api/blogs/slug/:slug



export const getBlogBySlug = asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    console.log(slug);

    if (!slug) {
        throw new ApiError(400, "Slug is required.");
    }

    const blog = await Blog.findOne({ slug })
        .populate("author", "fullname username email")
        .populate("category", "name subCategories")
        .populate({ // This is the correct way for nested population
            path: 'comments', // Target the 'comments' array in the Blog model
            // No 'select' here means all fields from the Comment document will be included
            populate: {       // Nested populate for the author within each comment
                path: 'user',   // Target the 'user' field in the Comment model (which references User)
                // No 'select' here means all fields from the User document will be included
            }
        })
        .lean();

    console.log("Blog ---- "+blog);


    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    res.status(200).json({
        success: true,
        blog,
    });
});





export const updateBlog = asyncHandler(async (req, res) => {
    const user = req.user;
    const blogId = req.params.Id;

    if (!user) {
        throw new ApiError(401, "You must be logged in to update a blog.");
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        throw new ApiError(400, "Invalid blog ID.");
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    if (blog.author.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this blog.");
    }

    const allowedFields = new Set([
        "title",
        "description",
        "mainImage",
        "storybasedImages",
        "content",
        "metaTitle",
        "metaDescription",
        "allowComments",
        "hideLikes",
        "tags",
        "category",
        "subCategories",
        "status",
    ]);

    const invalidFields = Object.keys(req.body).filter(
        (field) => !allowedFields.has(field)
    );

    if (invalidFields.length > 0) {
        throw new ApiError(
            400,
            `These fields are not allowed to be updated: ${invalidFields.join(", ")}`
        );
    }

    // CATEGORY & SUBCATEGORY VALIDATION
    if (req.body.category) {
        const categoryDoc = await Category.findById(req.body.category);
        if (!categoryDoc) {
            throw new ApiError(400, "Invalid category ID.");
        }

        if (req.body.subCategories?.length) {
            const normalize = (str) => str.trim().toLowerCase();
            const validSubs = new Set(categoryDoc.subCategories.map(normalize));
            const invalidSubs = req.body.subCategories.filter(
                (sub) => !validSubs.has(normalize(sub))
            );

            if (invalidSubs.length > 0) {
                throw new ApiError(
                    400,
                    `Invalid subCategories for this category: ${invalidSubs.join(", ")}`
                );
            }
        }
    }

    if (!req.body.category && req.body.subCategories?.length) {
        const categoryDoc = await Category.findById(blog.category);
        if (!categoryDoc) {
            throw new ApiError(400, "Associated category not found.");
        }

        const normalize = (str) => str.trim().toLowerCase();
        const validSubs = new Set(categoryDoc.subCategories.map(normalize));
        const invalidSubs = req.body.subCategories.filter(
            (sub) => !validSubs.has(normalize(sub))
        );

        if (invalidSubs.length > 0) {
            throw new ApiError(
                400,
                `Invalid subCategories for this category: ${invalidSubs.join(", ")}`
            );
        }
    }

    // FIELD UPDATES
    if (req.body.title) {
        const newTitle = req.body.title.trim();
        if (!newTitle) {
            throw new ApiError(400, "Title cannot be empty.");
        }
        if (newTitle.toLowerCase() !== blog.title.toLowerCase()) {
            blog.title = newTitle;
        }
    }

    if (req.body.description) {
        const newDesc = req.body.description.trim();
        if (!newDesc) {
            throw new ApiError(400, "Description cannot be empty.");
        }
        blog.description = newDesc;
    }

    if (req.body.mainImage) {
        const { url, alt, caption } = req.body.mainImage;

        if (!url?.trim() || !alt?.trim() || !caption?.trim()) {
            throw new ApiError(
                400,
                "Main image must include a valid URL, alt text, and caption."
            );
        }

        blog.mainImage = {
            url: url.trim(),
            alt: alt.trim(),
            caption: caption.trim()
        };
    }

    if (req.body.storybasedImages) {
        if (!Array.isArray(req.body.storybasedImages)) {
            throw new ApiError(400, "storybasedImages must be an array.");
        }

        const validImages = req.body.storybasedImages
            .map(img => typeof img === "string" ? img.trim() : null)
            .filter(Boolean);

        blog.storybasedImages = validImages;
    }

    if (req.body.content) {
        const content = req.body.content;
        if (!Array.isArray(content?.blocks) || content.blocks.length === 0) {
            throw new ApiError(400, "Content must have a valid 'blocks' array.");
        }
        blog.content = content;
    }

    if (req.body.metaTitle) {
        const metaTitle = req.body.metaTitle.trim();
        if (metaTitle.length > 60) {
            throw new ApiError(400, "Meta title must not exceed 60 characters.");
        }
        blog.metaTitle = metaTitle;
    }

    if (req.body.metaDescription) {
        const metaDescription = req.body.metaDescription.trim();
        if (metaDescription.length > 160) {
            throw new ApiError(400, "Meta description must not exceed 160 characters.");
        }
        blog.metaDescription = metaDescription;
    }

    if (typeof req.body.allowComments === "boolean") {
        blog.allowComments = req.body.allowComments;
    }

    if (typeof req.body.hideLikes === "boolean") {
        blog.hideLikes = req.body.hideLikes;
    }

    if (Array.isArray(req.body.tags)) {
        blog.tags = req.body.tags.map(tag => tag.trim()).filter(Boolean);
    }

    if (req.body.category) {
        blog.category = req.body.category;
    }

    if (req.body.subCategories) {
        blog.subCategories = req.body.subCategories;
    }

    if (req.body.status) {
        const validStatuses = ["draft", "published", "archived"];
        if (!validStatuses.includes(req.body.status)) {
            throw new ApiError(400, "Invalid status value.");
        }
        blog.status = req.body.status;
    }

    await blog.save();

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog updated successfully!"));
});


export const updateLikes = asyncHandler(async (req, res) => {
    // Blog Id
    const { Id } = req.query;
    //userId
    const userId = req.user._id;
    if (!Id || !userId) {
        throw new ApiError(400, "Both blogId and userId are required in query.");
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(blogId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid blogId or userId format.");
    }

    // Fetch the blog document
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    // Check if the user already liked the blog
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
        blog.likes.pull(userId);
    } else {
        blog.likes.push(userId);
    }

    await blog.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                liked: !alreadyLiked,
                totalLikes: blog.likes.length,
            },
            alreadyLiked ? "Blog unliked." : "Blog liked."
        )
    );
});


export const updateViews = asyncHandler(async (req, res) => {
    const { Id: blogId, userId, interactionTime = 0 } = req.query;

    // Validate blog ID
    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
        throw new ApiError(400, "A valid blog ID must be provided.");
    }

    // Validate optional userId
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }

    // Fetch blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    // Increment flat view count (always)
    blog.views = (blog.views || 0) + 1;

    // If a userId is present, update interaction log
    if (userId) {
        const existingEntry = blog.viewBy.find(
            (entry) => entry.user.toString() === userId
        );

        if (existingEntry) {
            existingEntry.interactionTime += Number(interactionTime);
        } else {
            blog.viewBy.push({
                user: userId,
                interactionTime: Number(interactionTime),
            });
        }
    }

    await blog.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalViews: blog.views,
                uniqueUserViews: blog.viewBy.length,
            },
            "View count updated."
        )
    );
});


export const updateShares = asyncHandler(async (req, res) => {
    const blogId = req.params.blogId;
    const userId = req.user?._id;
    const { medium } = req.body;

    const validMediums = ['email', 'whatsapp', 'twitter', 'facebook', 'copyLink', 'other'];
    if (!validMediums.includes(medium)) {
        throw new ApiError(400, "Invalid share medium.");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    // 1. Create a Share document
    const shareDoc = await Share.create({
        blog: blogId,
        user: userId || null,
        medium
    });

    // 2. Add share reference to the Blog
    blog.shares.push(shareDoc._id);
    await blog.save();

    // 3. Add share to user
    if (userId) {
        await User.findByIdAndUpdate(userId, {
            $push: { sharedBlogs: shareDoc._id }
        });
    }

    res.status(201).json(
        new ApiResponse(201, shareDoc, "Share recorded successfully.")
    );
});

export const myBlogs = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    const totalBlogs = await Blog.countDocuments({ author: userId });
    const blogs = await Blog.find({ author: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .populate("subCategories")
        .lean();

    return res.status(200).json(
        new ApiResponse(200, {
            blogs,
            page,
            limit,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
        }, "User's blogs fetched successfully with pagination.")
    );
})

export const searchByCategory = asyncHandler(async (req, res) => {
    const categoryId = req.query.category; // category ID in query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!categoryId) {
        throw new ApiError(400, "Category ID is required.");
    }

    const filter = {
        category: categoryId,
        status: "published" // Optional: only published blogs
    };

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullname")
        .populate("category", "name")
        .lean();

    return res.status(200).json(
        new ApiResponse(200, {
            blogs,
            page,
            limit,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit)
        }, "Blogs fetched by category successfully.")
    );
});

export const searchBySubCategories = asyncHandler(async (req, res) => {
    const { subCategories, category } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!Array.isArray(subCategories) || subCategories.length === 0) {
        throw new ApiError(400, "Subcategories must be provided in an array.");
    }

    const normalizedSubs = subCategories.map((sub) =>
        sub.trim().toLowerCase()
    );

    const filter = {
        subCategories: { $in: normalizedSubs },
        status: "published",
    };

    if (category) {
        filter.category = category;
    }

    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullname")
        .populate("category", "name")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                blogs,
                page,
                limit,
                totalBlogs,
                totalPages: Math.ceil(totalBlogs / limit),
            },
            "Blogs fetched successfully by subcategories."
        )
    );
});

export const searchByTags = asyncHandler(async (req, res) => {
    const { tags } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!Array.isArray(tags) || tags.length === 0) {
        throw new ApiError(400, "Tags must be provided in an array.");
    }

    const normalizedTags = tags.map(tag => tag.trim().toLowerCase());

    const filter = {
        tags: { $in: normalizedTags },
        status: "published"
    };

    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullname")
        .populate("category", "name")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                blogs,
                page,
                limit,
                totalBlogs,
                totalPages: Math.ceil(totalBlogs / limit)
            },
            "Blogs fetched successfully by tags."
        )
    );
});

export const universalSearch = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
        throw new ApiError(400, "Search query is required.");
    }

    const searchTerm = query.trim();

    // Step 1: Fetch matching categories
    const matchedCategories = await Category.find({
        name: { $regex: searchTerm, $options: "i" },
    }).select("_id");

    const matchedCategoryIds = matchedCategories.map((cat) => cat._id);

    // Step 2: Build the filter
    const filter = {
        $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { content: { $regex: searchTerm, $options: "i" } },
            { tags: { $regex: searchTerm, $options: "i" } },
            { subCategories: { $regex: searchTerm, $options: "i" } },
            { category: { $in: matchedCategoryIds } },
        ],
        status: "published", // only return published blogs
    };

    // Optional: Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullname")
        .populate("category", "name")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                blogs,
                page,
                limit,
                totalBlogs,
                totalPages: Math.ceil(totalBlogs / limit),
            },
            "Universal blog search successful."
        )
    );
});

export const mostViewedBlogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ status: "published" })
        .sort({ views: -1 }) // Most viewed first
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullname")
        .populate("category", "name")
        .lean();

    const total = await Blog.countDocuments({ status: "published" });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                blogs,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            "Most viewed blogs fetched successfully"
        )
    );
});

export const mostLikedBlogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.aggregate([
        {
            $match: { status: "published" },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
            },
        },
        {
            $sort: { likesCount: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
            },
        },
        {
            $unwind: "$author",
        },
        {
            $project: {
                title: 1,
                slug: 1,
                mainImage: 1,
                likesCount: 1,
                views: 1,
                author: { username: 1, fullname: 1 },
                createdAt: 1,
            },
        },
    ]);

    const total = await Blog.countDocuments({ status: "published" });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                blogs,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            "Most liked blogs fetched successfully"
        )
    );
});

export const mostSharedBlogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sharedData = await Share.aggregate([
        {
            $group: {
                _id: "$blog",
                shareCount: { $sum: 1 },
            },
        },
        {
            $sort: { shareCount: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $lookup: {
                from: "blogs",
                localField: "_id",
                foreignField: "_id",
                as: "blog",
            },
        },
        {
            $unwind: "$blog",
        },
        {
            $match: {
                "blog.status": "published", // only show published blogs
            },
        },
        {
            $project: {
                _id: 0,
                blogId: "$_id",
                shareCount: 1,
                title: "$blog.title",
                slug: "$blog.slug",
                mainImage: "$blog.mainImage",
                views: "$blog.views",
                likes: { $size: "$blog.likes" },
                createdAt: "$blog.createdAt",
            },
        },
    ]);

    const totalSharedBlogs = await Share.distinct("blog");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                sharedBlogs: sharedData,
                page,
                limit,
                total: totalSharedBlogs.length,
                totalPages: Math.ceil(totalSharedBlogs.length / limit),
            },
            "Most shared blogs fetched successfully"
        )
    );
});

export const getRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("subscribeTo").lean();
    if (!user) throw new ApiError(404, "User not found");

    const tagScores = new Map();
    const categoryScores = new Map();
    const subCatScores = new Map();

    const scoreUp = (map, key, val) => {
        if (!key) return;
        map.set(key, (map.get(key) || 0) + val);
    };

    // 1. Views (Interaction time) - P5
    const viewed = await Blog.find({ "viewBy.user": userId, status: "published" }).lean();
    viewed.forEach(blog => {
        const view = blog.viewBy.find(v => v.user.toString() === userId.toString());
        const score = Math.min(view?.interactionTime / 1000 || 0, 5); // Cap interaction score
        blog.tags?.forEach(tag => scoreUp(tagScores, tag, score));
        scoreUp(categoryScores, blog.category?.toString(), score);
        blog.subCategories?.forEach(sc => scoreUp(subCatScores, sc, score));
    });

    // 2. Subscribed Authors - P5
    const subscribedBlogs = await Blog.find({
        author: { $in: user.subscribeTo || [] },
        status: "published"
    }).lean();
    subscribedBlogs.forEach(blog => {
        blog.tags?.forEach(tag => scoreUp(tagScores, tag, 5));
        scoreUp(categoryScores, blog.category?.toString(), 5);
        blog.subCategories?.forEach(sc => scoreUp(subCatScores, sc, 5));
    });

    // 3. Comments - P4
    const commentedBlogs = await Blog.find({ comments: { $in: user.comments }, status: "published" }).lean();
    commentedBlogs.forEach(blog => {
        blog.tags?.forEach(tag => scoreUp(tagScores, tag, 4));
        scoreUp(categoryScores, blog.category?.toString(), 4);
        blog.subCategories?.forEach(sc => scoreUp(subCatScores, sc, 4));
    });

    // 4. Likes - P3
    const likedBlogs = await Blog.find({ likes: userId, status: "published" }).lean();
    likedBlogs.forEach(blog => {
        blog.tags?.forEach(tag => scoreUp(tagScores, tag, 3));
        scoreUp(categoryScores, blog.category?.toString(), 3);
        blog.subCategories?.forEach(sc => scoreUp(subCatScores, sc, 3));
    });

    // 5. Shares - P3
    const shared = await Share.find({ user: userId }).populate("blog").lean();
    shared.forEach(({ blog }) => {
        blog.tags?.forEach(tag => scoreUp(tagScores, tag, 3));
        scoreUp(categoryScores, blog.category?.toString(), 3);
        blog.subCategories?.forEach(sc => scoreUp(subCatScores, sc, 3));
    });

    // Build interest criteria
    const tagList = Array.from(tagScores.keys());
    const catList = Array.from(categoryScores.keys());
    const subCatList = Array.from(subCatScores.keys());

    let blogs = [];
    if (tagList.length || catList.length || subCatList.length) {
        blogs = await Blog.find({
            status: "published",
            $or: [
                { tags: { $in: tagList } },
                { category: { $in: catList } },
                { subCategories: { $in: subCatList } }
            ]
        })
            .populate("author", "username")
            .lean();

        // Score each blog
        blogs.forEach(blog => {
            blog._score = 0;
            blog.tags?.forEach(tag => blog._score += tagScores.get(tag) || 0);
            blog._score += categoryScores.get(blog.category?.toString()) || 0;
            blog.subCategories?.forEach(sc => blog._score += subCatScores.get(sc) || 0);
        });

        blogs.sort((a, b) => b._score - a._score);
    }

    // Fallback to random if no relevant blogs
    if (!blogs.length) {
        blogs = await Blog.aggregate([
            { $match: { status: "published" } },
            { $sample: { size: 20 } }
        ]);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { blogs },
            "Home recommendations fetched successfully"
        )
    );
});

export const trendingBlogs = asyncHandler(async (req, res) => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Step 1: Get shares in last 24h and group by blog
    const shareAggregation = await Share.aggregate([
        {
            $match: {
                sharedAt: { $gte: last24Hours }
            }
        },
        {
            $group: {
                _id: "$blog",
                shareCount: { $sum: 1 }
            }
        }
    ]);

    const shareMap = {};
    shareAggregation.forEach(({ _id, shareCount }) => {
        shareMap[_id.toString()] = shareCount;
    });

    // Step 2: Get blogs with views and likes
    const blogs = await Blog.find({ status: "published" }).lean();

    const trending = blogs.map(blog => {
        const blogId = blog._id.toString();

        // Get views in last 24h
        const recentViews = (blog.viewBy || []).filter(view =>
            view?.createdAt >= last24Hours
        ).length;

        // Likes filtering (simplified): if you don't store like timestamps, count total likes
        const recentLikes = (blog.likes || []).length;

        const recentShares = shareMap[blogId] || 0;

        const score = (recentViews * 4) + (recentLikes * 3) + (recentShares * 5);

        return {
            ...blog,
            trendingScore: score
        };
    });

    // Step 3: Sort and send
    const sortedTrending = trending
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 20); // top 20 trending

    return res
        .status(200)
        .json(new ApiResponse(200, sortedTrending, "Trending blogs (24h)"));
});

export const getLatestBlogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ status: "published" })
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(limit)
        .populate("author", "username profilePicture")
        .populate("category", "name");

    const total = await Blog.countDocuments({ status: "published" });

    return res.status(200).json(
        new ApiResponse(200, {
            blogs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        }, "Latest blogs fetched successfully!")
    );
});

export const getTrendingBlogsByPeriod = asyncHandler(async (req, res) => {
    const { period } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
        case "weekly":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "monthly":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case "yearly":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case "daily":
        default:
            startDate = new Date(now.setDate(now.getDate() - 1));
            break;
    }

    const blogs = await Blog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: "published",
            },
        },
        {
            $addFields: {
                viewsInTime: {
                    $size: {
                        $filter: {
                            input: "$viewBy",
                            as: "view",
                            cond: { $gte: ["$$view.createdAt", startDate] },
                        },
                    },
                },
                likesInTime: {
                    $size: {
                        $filter: {
                            input: "$likes",
                            as: "like",
                            cond: { $gte: ["$$like.createdAt", startDate] },
                        },
                    },
                },
                sharesInTime: {
                    $size: {
                        $filter: {
                            input: "$shares",
                            as: "share",
                            cond: { $gte: ["$$share.createdAt", startDate] },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                trendingScore: {
                    $add: [
                        { $multiply: ["$viewsInTime", 4] },
                        { $multiply: ["$likesInTime", 3] },
                        { $multiply: ["$sharesInTime", 5] },
                    ],
                },
            },
        },
        { $sort: { trendingScore: -1 } },
        { $limit: 10 },
    ]);

    return res.status(200).json(
        new ApiResponse(200, blogs, `${period} trending blogs fetched`)
    );
});

export const getBlogsByTag = asyncHandler(async (req, res) => {
    const { tag } = req.query;

    if (!tag) {
        throw new ApiError(400, "Tag is required");
    }

    const blogs = await Blog.find({
        status: "published",
        tags: tag
    })
        .populate("author", "username fullname profilePicture")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            blogs,
            `Blogs fetched successfully for tag: ${tag}`
        )
    );
});

export const updateBlogStatus = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "archived"].includes(status)) {
        throw new ApiError(400, "Invalid status. Must be 'draft', 'published', or 'archived'");
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    blog.status = status;
    await blog.save();

    return res
        .status(200)
        .json(new ApiResponse(200, blog, `Blog status updated to '${status}' successfully`));
});

export const getAllPendingComments = asyncHandler(async (req, res) => {
    const blogsWithPending = await Blog.find({
        pendingComments: { $exists: true, $not: { $size: 0 } }
    }).select("pendingComments");

    const pendingCommentIds = blogsWithPending.flatMap(blog => blog.pendingComments);

    if (!pendingCommentIds.length) {
        return res.status(200).json(new ApiResponse(200, [], "No pending comments found"));
    }

    const pendingComments = await Comment.find({ _id: { $in: pendingCommentIds } })
        .populate("author", "username fullname profilePicture")
        .populate("blog", "title slug");

    return res.status(200).json(
        new ApiResponse(200, pendingComments, "All pending comments fetched successfully")
    );
});

export const approvePendingComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Find the blog that has this comment in pendingComments
    const blog = await Blog.findOne({ pendingComments: comment._id });

    if (!blog) {
        throw new ApiError(404, "This comment is not pending or associated with any blog");
    }

    // Remove from pendingComments and add to comments
    blog.pendingComments.pull(comment._id);
    blog.comments.push(comment._id);
    await blog.save();

    return res.status(200).json(
        new ApiResponse(200, { comment, blogId: blog._id }, "Comment approved successfully")
    );
});

export const deletePendingComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const blog = await Blog.findOne({ pendingComments: comment._id });
    if (!blog) {
        throw new ApiError(404, "Comment not found in any blog's pending list");
    }

    // Remove comment ID from blog's pendingComments
    blog.pendingComments.pull(comment._id);
    await blog.save();

    // Delete the comment document itself
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, null, "Pending comment deleted successfully")
    );
});

export const approveMultiplePendingComments = asyncHandler(async (req, res) => {
    const { commentIds } = req.body;

    // Validate input
    if (!Array.isArray(commentIds) || commentIds.length === 0) {
        throw new ApiError(400, "commentIds must be a non-empty array of IDs");
    }

    const validCommentIds = commentIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validCommentIds.length === 0) {
        throw new ApiError(400, "No valid comment IDs provided");
    }

    // Fetch comments and group by blog
    const comments = await Comment.find({ _id: { $in: validCommentIds } });

    const blogUpdates = new Map();

    for (const comment of comments) {
        const blog = await Blog.findOne({ pendingComments: comment._id });

        if (!blog) continue;

        if (!blogUpdates.has(blog._id)) {
            blogUpdates.set(blog._id, blog);
        }

        blog.pendingComments.pull(comment._id);
        blog.comments.addToSet(comment._id); // Prevent duplicate if already present
    }

    // Save updates
    await Promise.all([...blogUpdates.values()].map(blog => blog.save()));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                approvedCount: comments.length,
                updatedBlogs: blogUpdates.size,
            },
            "Selected comments approved successfully"
        )
    );
});

export const deleteMultiplePendingComments = asyncHandler(async (req, res) => {
    const { commentIds } = req.body;

    // Validate input
    if (!Array.isArray(commentIds) || commentIds.length === 0) {
        throw new ApiError(400, "commentIds must be a non-empty array");
    }

    const validCommentIds = commentIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validCommentIds.length === 0) {
        throw new ApiError(400, "No valid comment IDs provided");
    }

    // Remove comments from Blog.pendingComments
    const blogs = await Blog.find({ pendingComments: { $in: validCommentIds } });

    for (const blog of blogs) {
        blog.pendingComments = blog.pendingComments.filter(
            id => !validCommentIds.includes(id.toString())
        );
        await blog.save();
    }

    // Delete the comments themselves
    const deleteResult = await Comment.deleteMany({ _id: { $in: validCommentIds } });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedCount: deleteResult.deletedCount,
                updatedBlogs: blogs.length,
            },
            "Pending comments deleted successfully"
        )
    );
});

export const deleteAllPendingComments = asyncHandler(async (req, res) => {
    // Step 1: Fetch all pending comment IDs from blogs
    const blogs = await Blog.find({ pendingComments: { $exists: true, $not: { $size: 0 } } });

    const allPendingCommentIds = blogs.flatMap(blog =>
        blog.pendingComments.map(id => id.toString())
    );

    if (allPendingCommentIds.length === 0) {
        throw new ApiError(404, "No pending comments found");
    }

    // Step 2: Remove pending comment references from blogs
    for (const blog of blogs) {
        blog.pendingComments = [];
        await blog.save();
    }

    // Step 3: Delete those comments from the collection
    const deleteResult = await Comment.deleteMany({ _id: { $in: allPendingCommentIds } });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedComments: deleteResult.deletedCount,
                affectedBlogs: blogs.length
            },
            "All pending comments deleted successfully"
        )
    );
});

export const approveAllPendingComments = asyncHandler(async (req, res) => {
    // Step 1: Find blogs with pending comments
    const blogs = await Blog.find({ pendingComments: { $exists: true, $not: { $size: 0 } } });

    if (!blogs.length) {
        throw new ApiError(404, "No blogs with pending comments found");
    }

    let totalApproved = 0;

    // Step 2: Move pending comments to comments array
    for (const blog of blogs) {
        const approvedCount = blog.pendingComments.length;

        blog.comments.push(...blog.pendingComments);
        blog.pendingComments = [];
        await blog.save();

        totalApproved += approvedCount;
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { totalApproved, updatedBlogs: blogs.length },
            "All pending comments approved successfully"
        )
    );
});

export const reportComment = asyncHandler(async (req, res) => {
    const { commentId, reason, customReason } = req.body;
    const reportedBy = req.user?._id || req.body.userId; // fallback for admin testing

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Valid comment ID is required");
    }

    if (!reason) {
        throw new ApiError(400, "Report reason is required");
    }

    // Optional: check if comment exists
    const commentExists = await Comment.findById(commentId);
    if (!commentExists) {
        throw new ApiError(404, "Comment not found");
    }

    // Prevent duplicate report by same user
    const alreadyReported = await ReportedComment.findOne({
        content: commentId,
        reportedBy,
    });

    if (alreadyReported) {
        throw new ApiError(409, "You have already reported this comment");
    }

    const report = await ReportedComment.create({
        content: commentId,
        reportedBy,
        reason,
        customReason,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, report, "Comment reported successfully"));
});

export const updateBlogCommentPermission = asyncHandler(async (req, res) => {
    const { blogId, allowComments } = req.body;

    if (!blogId || typeof allowComments !== "boolean") {
        throw new ApiError(400, "Blog ID and allowComments (true/false) are required");
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { allowComments },
        { new: true }
    );

    if (!updatedBlog) {
        throw new ApiError(404, "Blog not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedBlog,
            `Commenting has been ${allowComments ? "enabled" : "disabled"} for the blog`
        )
    );
});












