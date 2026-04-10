import React, { useState, useEffect } from 'react';
import { playbookService } from '../api/services';
import { Send, MessageCircle, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PlaybookComments = ({ playbookId, authorId, addToast }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Pagination flag for root comments (top 2 initially)
    const [showAllComments, setShowAllComments] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [playbookId]);

    const fetchComments = async () => {
        try {
            const res = await playbookService.getPlaybookComments(playbookId);
            if (res.data.status === 'success') {
                setComments(res.data.data.comments || []);
            }
        } catch (err) {
            console.error('Failed to fetch comments', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        e.preventDefault();
        const content = parentId ? replyText : newComment;
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await playbookService.addPlaybookComment(playbookId, {
                content,
                parent_id: parentId
            });
            if (res.data.status === 'success') {
                setReplyingTo(null);
                setReplyText('');
                setNewComment('');
                addToast("Comment posted!", "success");
                await fetchComments();
            }
        } catch (err) {
            console.error('Failed to add comment', err);
            addToast("Failed to post comment", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (commentId, newContent, onSuccess) => {
        if (!newContent.trim()) return;
        try {
            const res = await playbookService.updatePlaybookComment(playbookId, commentId, { content: newContent });
            if (res.data.status === 'success') {
                addToast("Comment updated!", "success");
                if (onSuccess) onSuccess();
                await fetchComments();
            }
        } catch (err) {
            console.error('Failed to update comment', err);
            addToast("Failed to update comment", "error");
        }
    };

    const handleDelete = async (commentId, onRemoveCb) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await playbookService.deletePlaybookComment(playbookId, commentId);
            if (res.data.status === 'success') {
                addToast("Comment deleted!", "success");
                if (onRemoveCb) onRemoveCb();
                await fetchComments();
            }
        } catch (err) {
            console.error('Failed to delete comment', err);
            addToast("Failed to delete comment", "error");
        }
    };

    const CommentRender = ({ comment, depth = 0, onRemoveMe }) => {
        const isAuthor = user?.id === comment.user_id;
        const isPlaybookAuthor = authorId === comment.user_id;
        const occupation = comment.user?.mentor?.role || comment.user?.mentee?.role || 'Member';

        const picture = comment.user?.picture !== "http://localhost:5000/uploads/default.png" 
             ? comment.user?.picture 
             : null;

        const [localReplies, setLocalReplies] = useState(comment.replies || []);
        const [showReplies, setShowReplies] = useState(false);
        const [loadingReplies, setLoadingReplies] = useState(false);
        const [replyPage, setReplyPage] = useState(1);
        const [hasMoreReplies, setHasMoreReplies] = useState(comment.replyCount > (comment.replies?.length || 0));
        
        const [internalContent, setInternalContent] = useState(comment.content);
        const [internalEditing, setInternalEditing] = useState(false);
        const [internalEditText, setInternalEditText] = useState(internalContent);
        
        // Ensure localReplies updates if parent comment object passes new deeply nested replies
        useEffect(() => {
            if (comment.replies && comment.replies.length > 0) {
               setLocalReplies(comment.replies);
            }
            setInternalContent(comment.content);
            setInternalEditText(comment.content);
        }, [comment]);

        const loadContentReplies = async (pageToLoad = 1) => {
            setLoadingReplies(true);
            try {
                const res = await playbookService.getPlaybookReplies(playbookId, comment.id, pageToLoad);
                if (res.data.status === 'success') {
                    if (pageToLoad === 1) {
                        setLocalReplies(res.data.data.replies);
                    } else {
                        setLocalReplies(prev => {
                            const newRep = res.data.data.replies.filter(r => !prev.find(p => p.id === r.id));
                            return [...prev, ...newRep];
                        });
                    }
                    setReplyPage(pageToLoad + 1);
                    setHasMoreReplies(res.data.currentPage < res.data.totalPages);
                }
            } catch (err) {
                console.error("Failed to load replies", err);
            } finally {
                setLoadingReplies(false);
                setShowReplies(true);
            }
        };

        const handleToggleReplies = () => {
            if (showReplies) {
                setShowReplies(false);
            } else {
                if (localReplies.length === 0) {
                    loadContentReplies(1);
                } else {
                    setShowReplies(true);
                }
            }
        };

        const executeInternalEdit = () => {
             handleEditSubmit(comment.id, internalEditText, () => {
                 setInternalContent(internalEditText);
                 setInternalEditing(false);
             });
        };

        const removeChild = (childId) => {
             setLocalReplies(prev => prev.filter(c => c.id !== childId));
        };

        return (
            <div className={`flex gap-4 ${depth > 0 ? 'ml-8 sm:ml-12 mt-4' : 'mt-6 bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100'}`}>
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full border border-gray-200 overflow-hidden bg-white flex items-center justify-center shadow-sm">
                    {picture ? (
                        <img src={picture} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-primary font-bold">{comment.user?.name?.charAt(0) || 'U'}</span>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900 truncate">{comment.user?.name || 'User'}</span>
                        
                        {isPlaybookAuthor && (
                            <span className="text-[10px] font-bold text-white bg-primary px-2.5 py-0.5 rounded-full shadow-sm">
                                Author
                            </span>
                        )}
                        
                        {!isPlaybookAuthor && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-white border border-gray-100 rounded-md">
                                {occupation}
                            </span>
                        )}
                        
                        {isAuthor && (
                            <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
                                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                    <button onClick={() => { setInternalEditing(true); setInternalEditText(internalContent); }} className="p-1 text-gray-400 hover:text-blue-500 transition-colors" title="Edit"><Edit2 size={12} /></button>
                                    <button onClick={() => handleDelete(comment.id, onRemoveMe)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        )}
                        {!isAuthor && (
                            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    
                    {internalEditing ? (
                        <div className="mt-2 flex gap-2">
                            <input 
                                value={internalEditText} 
                                onChange={(e) => setInternalEditText(e.target.value)} 
                                className="flex-1 bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-sm focus:outline-none"
                                autoFocus
                            />
                            <button onClick={executeInternalEdit} className="px-3 bg-primary text-white rounded-lg hover:bg-primary-dark text-xs font-bold transition-colors">Save</button>
                            <button onClick={() => setInternalEditing(false)} className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs font-bold transition-colors">Cancel</button>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mt-2">{internalContent}</p>
                    )}
                    
                    {depth < 2 && user && !internalEditing && (
                        <button 
                            onClick={() => {
                                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                setReplyText('');
                            }}
                            className="text-xs font-bold text-gray-500 hover:text-primary mt-3 inline-flex items-center gap-1 transition-colors"
                        >
                            <MessageCircle size={12} /> {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                        </button>
                    )}

                    {replyingTo === comment.id && (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!replyText.trim()) return;
                            setIsSubmitting(true);
                            try {
                                const res = await playbookService.addPlaybookComment(playbookId, { content: replyText, parent_id: comment.id });
                                if (res.data.status === 'success') {
                                    setReplyText('');
                                    setReplyingTo(null);
                                    addToast("Reply posted!", "success");
                                    // if replies not open, open them
                                    if (!showReplies) setShowReplies(true);
                                    // re-fetch from start to show new reply at bottom safely
                                    loadContentReplies(1);
                                }
                            } catch (err) {}
                            setIsSubmitting(false);
                        }} className="mt-4 flex gap-3 relative animate-in fade-in slide-in-from-top-2">
                             <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center border border-gray-100 hidden sm:flex">
                                {user?.picture && user.picture !== "http://localhost:5000/uploads/default.png" ? (
                                    <img src={user.picture} alt="You" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-primary font-bold text-xs">{user?.name?.charAt(0) || 'U'}</span>
                                )}
                             </div>
                             <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full bg-white border border-gray-200 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                                    autoFocus
                                />
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !replyText.trim()}
                                    className={`absolute right-1 top-1 bottom-1 p-1.5 rounded-full flex items-center justify-center transition-colors ${
                                        isSubmitting || !replyText.trim() ? 'text-gray-300' : 'text-primary hover:bg-primary/10'
                                    }`}
                                >
                                    {isSubmitting ? <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /> : <Send size={16} />}
                                </button>
                             </div>
                        </form>
                    )}

                    {/* View Replies Toggle */}
                    {comment.replyCount > 0 && depth === 0 && (
                        <div className="mt-3">
                            <button 
                                onClick={handleToggleReplies} 
                                className="text-xs font-bold text-primary hover:underline transition-all flex items-center gap-1.5"
                            >
                                <div className="w-6 h-[1px] bg-primary/30"></div>
                                {showReplies ? 'Hide replies' : `View replies (${comment.replyCount})`}
                            </button>
                        </div>
                    )}

                    {showReplies && localReplies.length > 0 && (
                        <div className="space-y-2 mt-2 relative before:absolute before:inset-y-0 before:-left-6 sm:before:-left-8 before:w-px before:bg-gray-100">
                            {localReplies.map(reply => (
                                <CommentRender key={reply.id} comment={reply} depth={depth + 1} onRemoveMe={() => removeChild(reply.id)} />
                            ))}
                            
                            {hasMoreReplies && (
                                <button 
                                    onClick={() => loadContentReplies(replyPage)}
                                    disabled={loadingReplies}
                                    className="text-xs font-bold text-primary hover:underline mt-4 ml-8 inline-flex items-center"
                                >
                                    {loadingReplies ? 'Loading...' : 'View more replies'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
                <MessageCircle className="mr-3 text-primary" size={28} /> Discussions
                <span className="ml-3 text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
                </span>
            </h3>

            {user ? (
                <form onSubmit={(e) => handleCommentSubmit(e, null)} className="mb-10 p-6 bg-white border border-gray-100 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex gap-4">
                     <div className="h-12 w-12 shrink-0 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {user.picture && user.picture !== "http://localhost:5000/uploads/default.png" ? (
                            <img src={user.picture} alt="You" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-primary font-bold">{user?.name?.charAt(0) || 'U'}</span>
                        )}
                     </div>
                     <div className="flex-1 flex flex-col items-end">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts, ask a question, or leave feedback..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner resize-none min-h-[100px]"
                        />
                        <button 
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className={`mt-3 px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all flex items-center ${
                                isSubmitting || !newComment.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                        >
                            <Send size={16} className="mr-2" /> Post Comment
                        </button>
                     </div>
                </form>
            ) : (
                <div className="bg-gray-50 p-6 rounded-3xl text-center text-gray-500 font-medium mb-10 border border-gray-100">
                    Please log in to join the discussion.
                </div>
            )}

            {loading ? (
                <div className="animate-pulse space-y-6">
                    {[1,2].map(i => (
                        <div key={i} className="flex gap-4 p-6 bg-gray-50 rounded-2xl">
                            <div className="h-12 w-12 bg-gray-200 rounded-full shrink-0"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                                <div className="h-3 bg-gray-200 w-full rounded"></div>
                                <div className="h-3 bg-gray-200 w-2/3 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {(showAllComments ? comments : comments.slice(0, 2)).map(comment => (
                        <CommentRender key={comment.id} comment={comment} />
                    ))}
                    
                    {comments.length > 2 && (
                        <button 
                            onClick={() => setShowAllComments(!showAllComments)}
                            className="w-full mt-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            {showAllComments ? 'Show Less' : `View All ${comments.length} Comments`}
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No comments yet. Be the first to share your thoughts!</p>
                </div>
            )}
        </div>
    );
};

export default PlaybookComments;
