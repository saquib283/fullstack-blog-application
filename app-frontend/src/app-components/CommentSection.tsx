'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { SendHorizonal, Heart, MoreVertical, Reply, ForwardIcon, Edit2, Trash2 } from 'lucide-react';
import { timeAgo } from '@/utils/timeAgo';
import usePost from '@/hooks/usePost';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import useMutation from '@/hooks/useMutation';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentUser {
    username: React.ReactNode;
    _id: string;
    fullname: string;
    profilePicture?: string;
}

interface AuthStoreUser {
    id: string;
    username: string;
    email: string;
    fullname: string;
    profilePicture?: string;
    role: string;
}

interface BaseComment {
    _id: string;
    user: CommentUser;
    content: string;
    createdAt: string;
    likes: string[];
}

interface ClientSideComment extends BaseComment {
    likesCount: number;
    isLikedByMe: boolean;
}

interface CommentSectionProps {
    blogId: string;
    initialComments: BaseComment[];
    allowComments: boolean;
}


const CommentSection: React.FC<CommentSectionProps> = ({ blogId, initialComments, allowComments }) => {
    const [newCommentText, setNewCommentText] = useState('');
    const { user, accessToken } = useAuthStore() as { user: AuthStoreUser | null; accessToken: string | null };

    const [openOptionsCommentId, setOpenOptionsCommentId] = useState<string | null>(null);
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);

    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [commentToUpdate, setCommentToUpdate] = useState<ClientSideComment | null>(null);
    const [updatedCommentContent, setUpdatedCommentContent] = useState('');

    const [currentComments, setCurrentComments] = useState<ClientSideComment[]>(
        (Array.isArray(initialComments) ? initialComments : [])
            .map(comment => ({
                ...comment,
                likesCount: comment.likes.length,
                isLikedByMe: comment.likes.includes(user?.id || '')
            }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );

    const { data: postResponseData, postData, loading: isPosting, error: postError } = usePost<{ content: string }, { data: BaseComment }>(
        `/comments/add-comment/${blogId}`
    );

    const { mutate: deleteCommentApi, loading: isDeletingComment, error: deleteCommentError } = useMutation(
        `/comments/delete-comment`,
        'delete'
    );

    const { mutate: updateCommentApi, loading: isUpdatingComment, error: updateCommentError } = useMutation<{
        data: BaseComment; content: string
    }, { data: BaseComment }>(
        `/comments/update-comment`,
        'patch'
    );

    useEffect(() => {
        if (postResponseData) {
            const newCommentFromServer = postResponseData.data;

            if (newCommentFromServer) {
                if (!user) {
                    toast.error('User data missing for new comment hydration.');
                    return;
                }

                const hydratedUser: CommentUser = {
                    _id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    profilePicture: user.profilePicture,
                };

                const clientSideNewComment: ClientSideComment = {
                    _id: newCommentFromServer._id,
                    user: hydratedUser,
                    content: newCommentFromServer.content,
                    createdAt: newCommentFromServer.createdAt,
                    likes: newCommentFromServer.likes || [],
                    likesCount: newCommentFromServer.likes ? newCommentFromServer.likes.length : 0,
                    isLikedByMe: false,
                };
                setCurrentComments(prevComments => [clientSideNewComment, ...prevComments]);
                setNewCommentText('');
                toast.success('Comment posted successfully!');
            } else {
                toast.error('Failed to post comment: No comment data received from server response.');
            }
        }
        if (postError) {
            console.error('Failed to post comment:', postError);
            toast.error('Failed to post comment. Please try again.');
        }
    }, [postResponseData, postError, user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setOpenOptionsCommentId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handlePostComment = async () => {
        if (!user) {
            toast.error('You must be logged in to post a comment.');
            return;
        }
        if (!newCommentText.trim()) {
            toast.error('Comment cannot be empty!');
            return;
        }
        if (!allowComments) {
            toast.error('Comments are not allowed on this blog.');
            return;
        }

        try {
            await postData(
                { content: newCommentText.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error initiating post comment:', error);
        }
    };

    const handleCommentLike = (commentId: string) => {
        if (!user) {
            toast.error('You must be logged in to like a comment.');
            return;
        }
        setCurrentComments(prevComments =>
            prevComments.map(comment => {
                if (comment._id === commentId) {
                    const newLikedStatus = !comment.isLikedByMe;
                    const updatedLikesCount = comment.likesCount + (newLikedStatus ? 1 : -1);
                    return {
                        ...comment,
                        isLikedByMe: newLikedStatus,
                        likesCount: Math.max(0, updatedLikesCount),
                    };
                }
                return comment;
            })
        );
        toast.success(`Comment ${currentComments.find(c => c._id === commentId)?.isLikedByMe ? 'unliked' : 'liked'}!`);
    };

    const toggleOptions = (commentId: string) => {
        setOpenOptionsCommentId(prevId => (prevId === commentId ? null : commentId));
    };

    const confirmDeleteComment = (commentId: string) => {
        if (!user) {
            toast.error('You must be logged in to delete a comment.');
            return;
        }
        const commentAuthorId = currentComments.find(c => c._id === commentId)?.user?._id;
        if (commentAuthorId !== user.id) {
            toast.error('You can only delete your own comments.');
            return;
        }
        setCommentToDeleteId(commentId);
        setShowDeleteConfirm(true);
        setOpenOptionsCommentId(null);
    };


    const executeDeleteComment = async () => {
        if (!commentToDeleteId) return;

        try {
            const deleteUrl = `/comments/delete-comment/${commentToDeleteId}`;
            await deleteCommentApi(undefined, {
                url: deleteUrl,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setCurrentComments(prevComments => prevComments.filter(comment => comment._id !== commentToDeleteId));
            toast.success('Comment deleted successfully!');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Failed to delete comment. Please try again.');
        } finally {
            setCommentToDeleteId(null);
            setShowDeleteConfirm(false);
        }
    };

    const handleUpdateComment = (commentId: string) => {
        if (!user) {
            toast.error('You must be logged in to update a comment.');
            return;
        }
        const commentToEdit = currentComments.find(c => c._id === commentId);
        if (!commentToEdit) {
            toast.error('Could not find the comment to update.');
            return;
        }
        if (commentToEdit.user._id !== user.id) {
            toast.error('You can only update your own comments.');
            return;
        }
        setCommentToUpdate(commentToEdit);
        setUpdatedCommentContent(commentToEdit.content);
        setShowUpdateDialog(true);
        setOpenOptionsCommentId(null);
    };

    const executeUpdateComment = async () => {
        if (!commentToUpdate || !updatedCommentContent.trim()) {
            toast.error('Comment content cannot be empty.');
            return;
        }

        try {
            const updateUrl = `/comments/update-comment/${commentToUpdate._id}`;
            const response = await updateCommentApi({ content: updatedCommentContent.trim() }, {
                url: updateUrl,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response?.data) {
                setCurrentComments(prevComments =>
                    prevComments.map(comment =>
                        comment._id === commentToUpdate._id
                            ? { ...comment, content: response?.data.content }
                            : comment
                    )
                );
                toast.success("Comment updated successfully!");
            } else {
                toast.error("Failed to update comment: No data received from server.");
            }
        } catch (error) {
            console.error('Failed to update comment:', error);
            toast.error('Failed to update comment. Please try again.');
        } finally {
            setShowUpdateDialog(false);
            setCommentToUpdate(null);
            setUpdatedCommentContent('');
        }
    };


    const handleReportComment = (commentId: string) => {
        if (!user) {
            toast.error('You must be logged in to report a comment.');
            return;
        }
        toast.success(`Comment ID: ${commentId} reported.`);
        setOpenOptionsCommentId(null);
    };

    const isUserLoggedIn = !!user;

    function handleReply(_id: string): void {
        toast.error("Reply functionality is not implemented yet.")
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 font-fredorka">Comments ({currentComments.length})</h2>

            {allowComments ? (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Leave a Comment</h3>
                    {!isUserLoggedIn && (
                        <p className="text-red-500 dark:text-red-400 mb-3">Please log in to post comments.</p>
                    )}
                    <Textarea
                        className="w-full p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[80px]"
                        placeholder="Share your thoughts..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        rows={3}
                        disabled={isPosting || !isUserLoggedIn}
                    />
                    <Button
                        onClick={handlePostComment}
                        disabled={isPosting || !newCommentText.trim() || !isUserLoggedIn}
                        className={`mt-3 px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300
                            ${isPosting || !newCommentText.trim() || !isUserLoggedIn
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isPosting ? 'Posting...' : (
                            <span className="flex items-center justify-center gap-2">
                                Post Comment <SendHorizonal size={18} />
                            </span>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                    Commenting is disabled for this blog post.
                </div>
            )}

            <div className="space-y-6">
                {currentComments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No comments yet. Be the first to comment!</p>
                ) : (
                    currentComments.map((comment) => (
                        <div key={comment._id} className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start mb-2">
                                {comment.user?.profilePicture ? (
                                    <Image
                                        src={comment.user.profilePicture}
                                        alt={comment.user.fullname || 'User'}
                                        width={20}
                                        height={20}
                                        className="w-9 h-9 rounded-full object-cover mr-3 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center text-blue-800 dark:text-blue-100 font-bold text-sm mr-3 flex-shrink-0">
                                        {comment.user?.fullname?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <p className="font-roboto text-gray-900 dark:text-gray-100 text-sm text-primaryGradient">@{comment.user?.username}</p>
                                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed mt-1">
                                        {comment.content}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {timeAgo(comment.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 pl-12 text-sm text-gray-600 dark:text-gray-400 relative" ref={openOptionsCommentId === comment._id ? optionsMenuRef : null}>
                                <button
                                    onClick={() => handleCommentLike(comment._id)}
                                    disabled={!isUserLoggedIn}
                                    className={`flex items-center gap-1 font-semibold  cursor-pointer hover:text-blue-200
                                        ${comment.isLikedByMe ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}
                                        ${!isUserLoggedIn ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <Heart size={16} fill={comment.isLikedByMe ? 'currentColor' : 'none'} strokeWidth={1.5} />
                                    <span>{comment.likesCount > 0 ? comment.likesCount : ''} Like</span>
                                </button>

                                <button
                                    onClick={() => handleReply(comment._id)}
                                    disabled={!isUserLoggedIn}
                                    className={`flex items-center gap-1 font-semibold  cursor-pointer`}
                                >
                                    <ForwardIcon size={16} strokeWidth={1.5} />
                                    <span> Reply</span>
                                </button>

                                {isUserLoggedIn && (
                                    <button
                                        onClick={() => toggleOptions(comment._id)}
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                        aria-label="Comment options"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                )}

                                {openOptionsCommentId === comment._id && (
                                    <div className="absolute z-10 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 w-32 -left-4 top-full mt-1 text-gray-800 dark:text-gray-200">
                                        {comment.user?._id === user?.id && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateComment(comment._id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <Edit2 size={16} /> Update
                                                </button>
                                                <button
                                                    onClick={() => confirmDeleteComment(comment._id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </>
                                        )}
                                        {isUserLoggedIn && (
                                            <button
                                                onClick={() => handleReportComment(comment._id)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                Report
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your comment
                            and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingComment}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDeleteComment}
                            disabled={isDeletingComment}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isDeletingComment ? 'Deleting...' : 'Continue'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Comment</DialogTitle>
                        <DialogDescription>
                            Make changes to your comment here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            id="commentContent"
                            value={updatedCommentContent}
                            onChange={(e) => setUpdatedCommentContent(e.target.value)}
                            className="col-span-3 min-h-[100px]"
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowUpdateDialog(false)}
                            disabled={isUpdatingComment}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={executeUpdateComment}
                            disabled={isUpdatingComment || !updatedCommentContent.trim()}
                        >
                            {isUpdatingComment ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CommentSection;