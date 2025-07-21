
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Blog } from "../models/blog.model.js";




const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); 
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};


export const registerUser = asyncHandler(async (req, res) => {

  const { fullname, email, username, password } = req.body;
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or Username already exists");
  }
  const profilePicture_LOCAL_PATH = req.files?.profilePicture[0]?.path;

  console.log(profilePicture_LOCAL_PATH);
  
  let profilePicture = await uploadOnCloudinary(profilePicture_LOCAL_PATH);


  if (!profilePicture) {
    throw new ApiError(400, "Avatar file is Required");
  }
  


  const user = await User.create({
    fullname,
    email,
    password,
    username: (username || "").toLowerCase(),
    profilePicture: profilePicture.url
  });
  const userExists = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userExists) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, userExists, "User registerd Successfully ."));
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
 
  const safeEmail = email?.trim();
  const safeUsername = username?.trim();
  const safePassword = password?.trim();

  if ((!safeEmail && !safeUsername) || !safePassword) {
    throw new ApiError(400, "Either username or email AND password are required");
  }

  const findUser = await User.findOne({
    $or: [
      safeEmail ? { email: safeEmail } : null,
      safeUsername ? { username: safeUsername } : null
    ].filter(Boolean)
  });

  if (!findUser) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await findUser.isPasswordCorrect(safePassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(findUser._id);

  const loggedInUser = await User.findById(findUser._id).select("-password -refreshtoken");

  const cookieOptions = {
    httpOnly: true,
    // secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { fullname, username, phone } = req.body;

  let profilePictureUrl;
  if (req.files?.profilePicture?.[0]?.path) {
    const uploaded = await uploadOnCloudinary(req.files.profilePicture[0].path);
    profilePictureUrl = uploaded?.url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      fullname,
      username,
      phone,
      ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});



export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res
      .status(401)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiError(401,  "Unauthorized: User not found"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return res
      .status(404)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiError(404, "User not found"));
  }

  user.refreshToken = null;
  await user.save();

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
    })
    .json(new ApiResponse(200, null, "Logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded?._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = user.generateAccessToken();

    return res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true })
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }
});

export const subscribeToUser = asyncHandler(async (req, res) => {
  const subscriberId = req.user?._id;
  const { subscribeToId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(subscribeToId)) {
    throw new ApiError(400, "Invalid subscribeTo user ID");
  }

  const subscriber = await User.findById(subscriberId);
  const targetUser = await User.findById(subscribeToId);

  if (!subscriber || !targetUser) {
    throw new ApiError(404, "Users not found");
  }

  subscriber.subscribeTo = subscribeToId;
  targetUser.subscribers = subscriberId;

  await subscriber.save({ validateBeforeSave: false });
  await targetUser.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
});

export const getUserSavedBlogs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not logged in");
  }

  const user = await User.findById(userId).populate({
    path: "savedBlogs",
    match: { status: "published" }, // Optional: only fetch published blogs
    populate: [
      { path: "author", select: "fullname username profilePicture" },
      { path: "category", select: "name" },
    ],
    select: "-pendingComments -__v"
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user.savedBlogs, "Saved blogs fetched successfully")
  );
});

export const getUserBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  const user = await User.findById(userId).populate({
    path: "bookmarks",
    match: { status: "published" }, // Optional: only published content
    populate: [
      { path: "author", select: "fullname username profilePicture" },
      { path: "category", select: "name" },
    ],
    select: "-pendingComments -__v"
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user.bookmarks, "Bookmarked blogs fetched successfully")
  );
});

export const getUserLikedBlogs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  const likedBlogs = await Blog.find({ likes: userId, status: "published" })
    .populate("author", "fullname username profilePicture")
    .populate("category", "name")
    .select("-pendingComments -__v")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, likedBlogs, "Liked blogs fetched successfully")
  );
});

export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.params.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId)
    .populate("subscribeTo", "username fullname profilePicture")
    .select("subscribeTo");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user.subscribeTo, "Subscribed users fetched successfully")
  );
});

export const getUserSubscribers = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.params.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId)
    .populate("subscribers", "username fullname profilePicture")
    .select("subscribers");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user.subscribers, "User's subscribers fetched successfully")
  );
});

export const getUserSharedBlogs = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const shares = await Share.find({ user: userId })
    .populate({
      path: "blog",
      populate: [
        { path: "author", select: "username fullname profilePicture" },
        { path: "category", select: "name" }
      ]
    })
    .sort({ sharedAt: -1 });

  const sharedBlogs = shares.map((share) => ({
    blog: share.blog,
    medium: share.medium,
    sharedAt: share.sharedAt
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, sharedBlogs, "User's shared blogs fetched successfully"));
});

export const userFavoriteCategory = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const blogs = await Blog.aggregate([
    {
      $match: {
        $or: [
          { likes: userId },
          { shares: { $elemMatch: { user: userId } } },
          { comments: { $elemMatch: { author: userId } } }, // Adjust if comment schema differs
          { viewBy: { $elemMatch: { user: userId } } }
        ]
      }
    },
    {
      $addFields: {
        likeScore: {
          $cond: [{ $in: [userId, "$likes"] }, 3, 0]
        },
        shareScore: {
          $cond: [
            { $in: [userId, "$shares.user"] },
            3,
            0
          ]
        },
        commentScore: {
          $cond: [
            { $in: [userId, "$comments.author"] },
            4,
            0
          ]
        },
        viewScore: {
          $reduce: {
            input: "$viewBy",
            initialValue: 0,
            in: {
              $cond: [
                { $eq: ["$$this.user", mongoose.Types.ObjectId(userId)] },
                { $add: ["$$value", { $divide: ["$$this.interactionTime", 1000] }] },
                "$$value"
              ]
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$category",
        totalScore: {
          $sum: {
            $add: ["$likeScore", "$shareScore", "$commentScore", "$viewScore"]
          }
        }
      }
    },
    {
      $sort: { totalScore: -1 }
    },
    {
      $limit: 1
    },
    {
      $lookup: {
        from: "categories", // match your actual category collection name
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    {
      $unwind: "$categoryDetails"
    },
    {
      $project: {
        category: "$categoryDetails.name",
        totalScore: 1
      }
    }
  ]);

  if (!blogs.length) {
    return res.status(200).json(new ApiResponse(200, null, "No interactions found for user"));
  }

  return res.status(200).json(new ApiResponse(200, blogs[0], "User's favorite category retrieved"));
});

export const getUserFavoriteSubcategory = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const blogs = await Blog.aggregate([
    {
      $match: {
        $or: [
          { likes: new mongoose.Types.ObjectId(userId) },
          { shares: { $elemMatch: { user: new mongoose.Types.ObjectId(userId) } } },
          { comments: { $exists: true } }, // We'll check in post-filter
          { viewBy: { $elemMatch: { user: new mongoose.Types.ObjectId(userId) } } }
        ]
      }
    },
    {
      $addFields: {
        likeScore: {
          $cond: [{ $in: [new mongoose.Types.ObjectId(userId), "$likes"] }, 3, 0]
        },
        shareScore: {
          $cond: [
            { $in: [new mongoose.Types.ObjectId(userId), "$shares.user"] },
            3,
            0
          ]
        },
        commentScore: {
          $cond: [
            { $in: [new mongoose.Types.ObjectId(userId), "$comments.author"] },
            4,
            0
          ]
        },
        viewScore: {
          $reduce: {
            input: "$viewBy",
            initialValue: 0,
            in: {
              $cond: [
                { $eq: ["$$this.user", new mongoose.Types.ObjectId(userId)] },
                { $add: ["$$value", { $divide: ["$$this.interactionTime", 1000] }] },
                "$$value"
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        totalScore: {
          $add: ["$likeScore", "$shareScore", "$commentScore", "$viewScore"]
        }
      }
    },
    { $unwind: "$subCategories" },
    {
      $group: {
        _id: "$subCategories",
        totalScore: { $sum: "$totalScore" }
      }
    },
    { $sort: { totalScore: -1 } },
    { $limit: 1 }, // or remove to get top 3-5
    {
      $project: {
        subcategory: "$_id",
        totalScore: 1,
        _id: 0
      }
    }
  ]);

  if (!blogs.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No favorite subcategory found for user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, blogs[0], "User's favorite subcategory retrieved"));
});

export const getUserFavoriteSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const objectId = new mongoose.Types.ObjectId(userId);

  const favoriteCreators = await Blog.aggregate([
    {
      $match: {
        $or: [
          { likes: objectId },
          { comments: { $exists: true, $not: { $size: 0 } } },
          { shares: { $exists: true, $not: { $size: 0 } } },
          { viewBy: { $elemMatch: { user: objectId } } }
        ]
      }
    },
    {
      $addFields: {
        likeScore: {
          $cond: [{ $in: [objectId, "$likes"] }, 3, 0]
        },
        commentScore: {
          $cond: [
            { $gt: [{ $size: "$comments" }, 0] },
            4,
            0
          ]
        },
        shareScore: {
          $cond: [
            { $gt: [{ $size: "$shares" }, 0] },
            5,
            0
          ]
        },
        viewScore: {
          $reduce: {
            input: "$viewBy",
            initialValue: 0,
            in: {
              $cond: [
                { $eq: ["$$this.user", objectId] },
                { $add: ["$$value", { $divide: ["$$this.interactionTime", 60000] }] }, // 1 pt per min
                "$$value"
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        totalScore: {
          $add: ["$likeScore", "$commentScore", "$shareScore", "$viewScore"]
        }
      }
    },
    {
      $group: {
        _id: "$author",
        totalScore: { $sum: "$totalScore" }
      }
    },
    { $sort: { totalScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "creator"
      }
    },
    { $unwind: "$creator" },
    {
      $project: {
        creator: {
          _id: "$creator._id",
          username: "$creator.username",
          fullname: "$creator.fullname",
          profilePicture: "$creator.profilePicture"
        },
        totalScore: 1
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        favoriteCreators,
        "Top 10 favorite subscribed creators fetched successfully"
      )
    );
});







