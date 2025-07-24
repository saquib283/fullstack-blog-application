


// 'use client';

// import { useParams } from "next/navigation";
// import useFetch from "@/hooks/useFetch";
// import EditorJsRenderer from '@/app-components/EditorJsRenderer';
// import CommentSection from '@/app-components/CommentSection';
// import { useEffect, useState } from "react";
// import { Heart, Share2, BellDot } from 'lucide-react';
// import toast from 'react-hot-toast';
// import useSocket from "@/hooks/useSocket";

// import { BlogType, CommentType } from "@/types/blog";

// export default function page() {
//     const params = useParams();
//     const slug = params.slug as string;

//     const [parsedBlogContent, setParsedBlogContent] = useState<any | null>(null);
//     const [isLiked, setIsLiked] = useState(false);
//     const [likeCount, setLikeCount] = useState(0);
//     const [shareCount, setShareCount] = useState(0);
//     const [isSubscribed, setIsSubscribed] = useState(false); // New state for subscribe button

//     const { data, loading, error } = useFetch<{ blog: BlogType }>(
//         `blogs/getblogbySlug/${slug}`
//     );

//     useEffect(() => {
//         if (data?.blog?.content) {
//             try {
//                 const contentObj = typeof data.blog.content === 'string'
//                     ? JSON.parse(data.blog.content)
//                     : data.blog.content;
//                 setParsedBlogContent(contentObj);
//             } catch (e) {
//                 console.error("Failed to parse blog content:", e);
//                 setParsedBlogContent(null);
//             }
//         }
//         if (data?.blog) {
//             setLikeCount(data.blog.likes?.length || 0);
//             setShareCount(data.blog.shares?.length || 0);
//             // TODO: In a real app, you'd check if the current user ID is in data.blog.likes
//             // For now, let's just initialize it based on some dummy logic or always false
//             setIsLiked(false); // You'll fetch user's like status from API
//             // TODO: Also fetch user's subscription status for this blog/author
//             setIsSubscribed(false);
//         }
//     }, [data]);


//     const handleLike = () => {
//         if (!data?.blog) return;

//         // Optimistic UI update
//         setIsLiked(prev => !prev);
//         setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
//         toast.success(isLiked ? 'Unliked!' : 'Liked!');

//         // TODO: Call your backend API to update the like status
//         // e.g., usePost hook or direct fetch
//         // const { postData } = usePost('/api/blog-like');
//         // postData({ blogId: data.blog._id, action: isLiked ? 'unlike' : 'like' });
//     };

//     const handleShare = async () => {
//         if (!data?.blog) return;

//         const blogUrl = window.location.href;
//         try {
//             if (navigator.share) {
//                 await navigator.share({
//                     title: data.blog.title,
//                     text: data.blog.shortDescription || 'Check out this awesome blog post!',
//                     url: blogUrl,
//                 });
//                 toast.success('Blog shared successfully!');
//             } else {
//                 await navigator.clipboard.writeText(blogUrl);
//                 toast.success('Blog URL copied to clipboard!');
//             }
//             setShareCount(prev => prev + 1); // Optimistic update
//             // TODO: Call backend to log share count
//         } catch (err) {
//             console.error('Failed to share:', err);
//             toast.error('Failed to share the blog.');
//         }
//     };

//     const handleSubscribe = () => {
//         setIsSubscribed(prev => !prev);
//         toast.success(isSubscribed ? 'Unsubscribed!' : 'Thanks for subscribing! Stay tuned for more updates.');
//         // TODO: Call your backend API to toggle subscription status
//     };

//     if (loading) return <div className="min-h-screen flex items-center justify-center p-8 text-xl text-gray-700 dark:text-gray-300">Loading blog content... 🌀</div>;
//     if (error || !data?.blog) return <div className="min-h-screen flex items-center justify-center p-8 text-xl text-red-500">Oops, blog not found or an error occurred 😢</div>;

//     const blog = data.blog;

//     return (
//         <div className="bg-background text-foreground rounded-xl p-8 border border-border space-y-6 max-w-4xl mx-auto font-roboto shadow-lg my-8">
//             <h1 className="text-4xl lg:text-5xl font-medium mb-4 text-gray-900 dark:text-gray-100 font-fredorka leading-tight">
//                 {blog.title}
//             </h1>
//             {blog.shortDescription && (
//                 <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg italic">
//                     {blog.shortDescription}
//                 </p>
//             )}

//             <div className="flex flex-wrap items-center text-gray-500 dark:text-gray-400 text-sm mb-8 gap-x-4 gap-y-2">
//                 <span className="font-semibold">By: {blog.author.fullname}</span>
//                 <span>•</span>
//                 <span>Published on: {new Date(blog.createdAt).toLocaleDateString()}</span>
//                 {blog.category && (
//                     <>
//                         <span>•</span>
//                         <span className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded-full text-xs">
//                             {blog.category.name}
//                         </span>
//                     </>
//                 )}
//                 {blog.subCategories && blog.subCategories.length > 0 && (
//                     <div className="flex gap-1 ml-2">
//                         {blog.subCategories.map((subCat, index) => (
//                             <span key={index} className="text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900 px-2 py-1 rounded-full text-xs">
//                                 {subCat}
//                             </span>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {blog.thumbnail?.url && (
//                 <div className="mb-8 rounded-lg overflow-hidden shadow-xl">
//                     <img
//                         src={blog.thumbnail.url}
//                         alt={blog.thumbnail.alt || blog.title}
//                         className="w-full h-auto object-cover max-h-96"
//                     />
//                     {blog.thumbnail.caption && (
//                         <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
//                             {blog.thumbnail.caption}
//                         </p>
//                     )}
//                 </div>
//             )}

//             {parsedBlogContent ? (
//                 <EditorJsRenderer data={parsedBlogContent} />
//             ) : (
//                 <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900 p-4 rounded-md mt-6">
//                     Error loading blog content. The content might be malformed or missing.
//                 </div>
//             )}

//             {/* LIKE, SHARE, SUBSCRIBE BUTTONS */}
//             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
//                 {!blog.hideLikes && (
//                     <button
//                         onClick={handleLike}
//                         aria-label={isLiked ? "Unlike this blog post" : "Like this blog post"}
//                         className={`flex items-center justify-center gap-2 px-5 py-2 rounded-sm text-base sm:text-lg font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap
//                             ${isLiked
//                                 ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg animate-pulse-once' // Added pulse-once animation
//                                 : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900 dark:hover:text-red-100 shadow-md'
//                             }`}
//                     >
//                         <Heart
//                             size={20}
//                             fill={isLiked ? 'currentColor' : 'none'}
//                             className={`${isLiked ? 'animate-heartbeat' : ''}`} // Apply heartbeat animation when liked
//                         />
//                         <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
//                     </button>
//                 )}

//                 <button
//                     onClick={handleShare}
//                     aria-label="Share this blog post"
//                     className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-semibold bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 transform active:scale-95 whitespace-nowrap dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-blue-900 dark:hover:text-blue-100 shadow-md"
//                 >
//                     <Share2 size={20} />
//                     <span>{shareCount} Shares</span>
//                 </button>

//                 <button
//                     onClick={handleSubscribe}
//                     aria-label={isSubscribed ? "Unsubscribe from this blog" : "Subscribe to this blog"}
//                     className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap
//                         ${isSubscribed
//                             ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
//                             : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
//                         }`}
//                 >
//                     <BellDot size={20} className={`${isSubscribed ? 'animate-bell-ring' : ''}`} /> {/* Apply animation */}
//                     <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
//                 </button>
//             </div>

//             {blog.tags && blog.tags.length > 0 && (
//                 <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
//                     <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 font-fredorka">Tags:</h3>
//                     <div className="flex flex-wrap gap-2">
//                         {blog.tags.map((tag, index) => (
//                             <span
//                                 key={index}
//                                 className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                             >
//                                 {tag}
//                             </span>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             <CommentSection
//                 blogId={blog._id}
//                 initialComments={blog.comments || []}
//                 allowComments={blog.allowComments || false}
//                 blogTitle={blog.title} // Pass blog title for share functionality in CommentSection
//             />
//         </div>
//     );
// }



























'use client';

import { useParams } from "next/navigation";
import useFetch from "@/hooks/useFetch";
import EditorJsRenderer from '@/app-components/EditorJsRenderer';
import CommentSection from '@/app-components/CommentSection';
import { useEffect, useState, useCallback } from "react";
import { Heart, Share2, BellDot, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useSocket from "@/hooks/useSocket";
import { useAuthStore } from "@/store/authStore";

import { BlogType, CommentType } from "@/types/blog";

// Define a type for the full API response structure
interface BlogApiResponse {
    statusCode: number;
    data: BlogType; // The actual blog object is nested under 'data'
    message: string;
    success: boolean;
}

export default function Page() {
    const params = useParams();
    const slug = params.slug as string;
    const { user } = useAuthStore();

    const [parsedBlogContent, setParsedBlogContent] = useState<any | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [viewsCount, setViewsCount] = useState(0);

    // Changed the type parameter for useFetch to BlogApiResponse
    // Renamed 'data' to 'fetchResult' to avoid naming conflict with 'fetchResult.data'
    const { data: fetchResult, loading, error } = useFetch<BlogApiResponse>(
        `blogs/getblogbySlug/${slug}`
    );

    // Extract the actual blog object from fetchResult.data
    const blog = fetchResult?.data; // This is the key change!

    // Access the socket instance
    const socket = useSocket();
    const userId = user?._id; // Get the current user's ID

    // Effect to parse blog content and initialize states based on fetched data
    useEffect(() => {
        if (blog?.content) { // Use the extracted 'blog' object
            try {
                const contentObj = typeof blog.content === 'string'
                    ? JSON.parse(blog.content)
                    : blog.content;
                setParsedBlogContent(contentObj);
            } catch (e) {
                console.error("Failed to parse blog content:", e);
                setParsedBlogContent(null);
            }
        }

        if (blog) { // Use the extracted 'blog' object
            // Initialize like count and check if the current user has liked it
            setLikeCount(blog.likes?.length || 0);
            setIsLiked(blog.likes?.includes(userId) || false); // Check if current user liked

            setShareCount(blog.shares?.length || 0);
            setViewsCount(blog.views || 0); // Initialize views from fetched data
            // TODO: Also fetch user's subscription status for this blog/author
            setIsSubscribed(false);
        }
    }, [blog, userId]); // Add blog and userId to dependency array

    // Effect for handling real-time likes updates
    useEffect(() => {
        if (!socket) return;

        const handleLikesUpdated = ({ blogId: updatedBlogId, likes }: { blogId: string, likes: number }) => {
            if (blog?._id === updatedBlogId) { // Use the extracted 'blog' object
                setLikeCount(likes);
                // Note: isLiked status update here would ideally come from the server
                // or be re-evaluated based on a list of likers if provided.
                // For now, we rely on the optimistic update in handleLike.
            }
        };

        socket.on("likes-updated", handleLikesUpdated);

        return () => {
            socket.off("likes-updated", handleLikesUpdated);
        };
    }, [socket, blog]); // Add blog to dependency array

    // Effect for handling real-time views updates
    useEffect(() => {
        if (!socket) return;

        const handleViewsUpdated = ({ blogId: updatedBlogId, views }: { blogId: string, views: number }) => {
            if (blog?._id === updatedBlogId) { // Use the extracted 'blog' object
                setViewsCount(views);
            }
        };

        socket.on("views-updated", handleViewsUpdated);

        return () => {
            socket.off("views-updated", handleViewsUpdated);
        };
    }, [socket, blog]); // Add blog to dependency array


    // Effect to emit view-blog event after a delay
    useEffect(() => {
        // Ensure blog data, socket, and userId are available before emitting a view
        if (!blog || !socket || !userId) return;

        const blogId = blog._id;
        const viewTimer = setTimeout(() => {
            socket.emit("view-blog", blogId);
        }, 5000); // Emit view after 5 seconds

        return () => clearTimeout(viewTimer); // Clean up timer on unmount
    }, [blog, socket, userId]); // Add blog and userId to dependencies for view tracking


    // Function to handle liking/unliking a blog
    const handleLike = useCallback(() => {
        // Ensure blog data, socket, and userId are available before allowing a like
        if (!blog || !socket || !userId) {
            toast.error("Please log in to like this blog.");
            return;
        }

        const blogId = blog._id;
        socket.emit("like-blog", { blogId, userId });

        // Optimistic UI update for isLiked status
        setIsLiked(prev => !prev);
        // The actual likeCount will be updated by the socket listener
        toast.success(isLiked ? 'Unliked!' : 'Liked!');
    }, [blog, socket, userId, isLiked]); // Added isLiked to dependencies for toast message

    const handleShare = async () => {
        if (!blog) return; // Use the extracted 'blog' object

        const blogUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: blog.title, // Use the extracted 'blog' object
                    text: blog.shortDescription || 'Check out this awesome blog post!', // Use the extracted 'blog' object
                    url: blogUrl,
                });
                toast.success('Blog shared successfully!');
            } else {
                await navigator.clipboard.writeText(blogUrl);
                toast.success('Blog URL copied to clipboard!');
            }
            setShareCount(prev => prev + 1); // Optimistic update
            // TODO: Call backend to log share count if needed for persistent share tracking
        } catch (err) {
            console.error('Failed to share:', err);
            toast.error('Failed to share the blog.');
        }
    };

    const handleSubscribe = () => {
        setIsSubscribed(prev => !prev);
        toast.success(isSubscribed ? 'Unsubscribed!' : 'Thanks for subscribing! Stay tuned for more updates.');
        // TODO: Call your backend API to toggle subscription status
    };

    // The error condition now correctly checks for 'blog' being null/undefined
    if (loading) return <div className="min-h-screen flex items-center justify-center p-8 text-xl text-gray-700 dark:text-gray-300">Loading blog content... 🌀</div>;
    if (error || !blog) return <div className="min-h-screen flex items-center justify-center p-8 text-xl text-red-500">Oops, blog not found or an error occurred 😢</div>;


    return (
        <div className="bg-background text-foreground rounded-xl p-8 border border-border space-y-6 max-w-4xl mx-auto font-roboto shadow-lg my-8">
            <h1 className="text-4xl lg:text-5xl font-medium mb-4 text-gray-900 dark:text-gray-100 font-fredorka leading-tight">
                {blog.title}
            </h1>
            {blog.shortDescription && (
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg italic">
                    {blog.shortDescription}
                </p>
            )}

            <div className="flex flex-wrap items-center text-gray-500 dark:text-gray-400 text-sm mb-8 gap-x-4 gap-y-2">
                <span className="font-semibold">By: {blog.author.fullname}</span>
                <span>•</span>
                <span>Published on: {new Date(blog.createdAt).toLocaleDateString()}</span>
                {blog.category && (
                    <>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded-full text-xs">
                            {blog.category.name}
                        </span>
                    </>
                )}
                {blog.subCategories && blog.subCategories.length > 0 && (
                    <div className="flex gap-1 ml-2">
                        {blog.subCategories.map((subCat, index) => (
                            <span key={index} className="px-2 py-1 rounded-full text-xs
                                text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900">
                                {subCat}
                            </span>
                        ))}
                    </div>
                )}
                {/* Display Views Count */}
                <span className="flex items-center gap-1 ml-auto text-gray-600 dark:text-gray-300">
                    <Eye size={18} />
                    <span>{viewsCount} Views</span>
                </span>
            </div>

            {blog.thumbnail?.url && (
                <div className="mb-8 rounded-lg overflow-hidden shadow-xl">
                    <img
                        src={blog.thumbnail.url}
                        alt={blog.thumbnail.alt || blog.title}
                        className="w-full h-auto object-cover max-h-96"
                    />
                    {blog.thumbnail.caption && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {blog.thumbnail.caption}
                        </p>
                    )}
                </div>
            )}

            {parsedBlogContent ? (
                <EditorJsRenderer data={parsedBlogContent} />
            ) : (
                <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900 p-4 rounded-md mt-6">
                    Error loading blog content. The content might be malformed or missing.
                </div>
            )}

            {/* LIKE, SHARE, SUBSCRIBE BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {!blog.hideLikes && (
                    <button
                        onClick={handleLike}
                        aria-label={isLiked ? "Unlike this blog post" : "Like this blog post"}
                        className={`flex items-center justify-center gap-2 px-5 py-2 rounded-sm text-base sm:text-lg font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap
                            ${isLiked
                                ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg animate-pulse-once'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900 dark:hover:text-red-100 shadow-md'
                            }`}
                    >
                        <Heart
                            size={20}
                            fill={isLiked ? 'currentColor' : 'none'}
                            className={`${isLiked ? 'animate-heartbeat' : ''}`}
                        />
                        <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                )}

                <button
                    onClick={handleShare}
                    aria-label="Share this blog post"
                    className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-semibold bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 transform active:scale-95 whitespace-nowrap dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-blue-900 dark:hover:text-blue-100 shadow-md"
                >
                    <Share2 size={20} />
                    <span>{shareCount} Shares</span>
                </button>

                <button
                    onClick={handleSubscribe}
                    aria-label={isSubscribed ? "Unsubscribe from this blog" : "Subscribe to this blog"}
                    className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap
                        ${isSubscribed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                        }`}
                >
                    <BellDot size={20} className={`${isSubscribed ? 'animate-bell-ring' : ''}`} />
                    <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                </button>
            </div>

            {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 font-fredorka">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <CommentSection
                blogId={blog._id}
                initialComments={blog.comments || []}
                allowComments={blog.allowComments || false}
                blogTitle={blog.title}
            />
        </div>
    );
}
