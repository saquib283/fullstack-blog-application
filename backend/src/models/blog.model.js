import mongoose, { Schema } from "mongoose";
import slugify from "slugify";


const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription:{
        type:String,
        required:true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    thumbnail: {
        url: { type: String, required: true },
        alt: { type: String, required: true },
        caption: { type: String, required: true }
    },
    content: {
        type: Schema.Types.Mixed, 
        required: true,
        validate: {
            validator: function (val) {
                return val && Array.isArray(val.blocks);
            },
            message: "Invalid Editor.js content structure"
        }
    },

    metaTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    pendingComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    hideLikes: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tags: [{
        type: String
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Share"
    }],
    viewBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        interactionTime :{
            type:Number,
            default:0
        }
    }],
    views:{
        type:Number,
        default:0
    },
    

    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "published"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCategories: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

blogSchema.pre("validate", async function (next) {
    if (this.isModified("title")) {
        let baseSlug = slugify(this.title, { lower: true, strict: true });
        let slug = baseSlug;
        let count = 1;
        while (await mongoose.models.Blog.findOne({ slug })) {
            slug = `${baseSlug}-${count++}`;
        }
        this.slug = slug;
    }
    next();
});


export const Blog = mongoose.model("Blog", blogSchema);
