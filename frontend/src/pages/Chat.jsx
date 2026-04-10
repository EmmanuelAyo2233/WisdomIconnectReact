import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Search, Send, MoreVertical, Image, Paperclip, MessageSquare, Trash2, Check, CheckCheck, File, Download, X } from 'lucide-react';
import { connectionService } from '../api/services';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Chat = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    
    // File Preview States
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    
    const fileInputRef = useRef(null);
    const fileImageRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [clearingChat, setClearingChat] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Load active (accepted) connections globally mapped
    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const res = await connectionService.getConnections();
                if (res.data?.data && Array.isArray(res.data.data)) {
                    const accepted = res.data.data.filter(c => c.status === "accepted");
                    const formatted = accepted.map(conn => {
                        // Extract the target user based on our own role
                        const isMentor = (user?.userType || user?.role) === 'mentor';
                        const targetUser = isMentor ? conn.mentee?.user : conn.mentor?.user;
                        
                        if (!targetUser) return null;

                        return {
                            id: targetUser.id,
                            connectionId: conn.id,
                            name: targetUser.name || 'Unknown User',
                            picture: targetUser.picture || null,
                            role: isMentor ? 'mentee' : 'mentor',
                            lastMessage: 'Tap to open chat',
                            unread: 0,
                            targetUserId: targetUser.id,
                            profile: isMentor ? conn.mentee : conn.mentor
                        };
                    }).filter(Boolean);
                    setConversations(formatted);
                }
            } catch (err) {
                console.error("Failed to load connections", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchConnections();
    }, [user]);

    // 2. Connect to Room when conversation selected
    useEffect(() => {
        if (activeChat && socket && user) {
            const fetchMessages = async () => {
                try {
                    const res = await api.get(`/chat/${activeChat.connectionId}/messages`);
                    if (res.data?.data) {
                        setMessages(res.data.data);
                    }
                } catch (e) {
                    console.log("No previous messages found");
                    setMessages([]);
                }
            };
            fetchMessages();

            socket.emit("join", { connectionId: activeChat.connectionId });
            
            const handleNewMessage = (msg) => {
                setMessages(prev => {
                    if (msg.senderId === user.id) return prev;
                    return [...prev, msg];
                });
            };

            const handleError = (err) => console.error("Socket error:", err);

            socket.on("receive_message", handleNewMessage);
            socket.on("error", handleError);
            
            socket.on('initial_user_status', (users) => {
                setOnlineUsers(new Set(users));
            });
            
            socket.on('user_status', ({ userId, status }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    if (status === 'online') next.add(userId);
                    else next.delete(userId);
                    return next;
                });
            });

            socket.on('messages_seen', ({ connectionId, seenBy }) => {
                if (activeChat.connectionId === connectionId && seenBy !== user.id) {
                   setMessages(prev => prev.map(m => (!m.isRead && m.senderId === user.id) ? { ...m, isRead: true } : m));
                }
            });

            return () => {
                socket.off("receive_message", handleNewMessage);
                socket.off("error", handleError);
                socket.off("initial_user_status");
                socket.off("user_status");
                socket.off("messages_seen");
            };
        }
    }, [activeChat, socket, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeChat || isSending) return;

        setIsSending(true);
        const isUploadingFile = !!selectedFile;
        const currentMessageText = newMessage;
        
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            senderId: user.id,
            message: currentMessageText || null,
            fileUrl: filePreview, // Temp object URL
            fileType: selectedFile?.type,
            fileName: selectedFile?.name,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        cancelFilePreview();

        try {
            let res;
            if (isUploadingFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                if (currentMessageText) formData.append("message", currentMessageText);

                res = await api.post(`/chat/${activeChat.connectionId}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await api.post(`/chat/${activeChat.connectionId}/messages`, {
                    message: currentMessageText
                });
            }

            const finalMessage = res.data?.data || optimisticMessage;
            setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? finalMessage : msg));

            if (socket && res.data?.status === 'success') {
                socket.emit('send-message', { ...finalMessage, connectionId: activeChat.connectionId });
            }
        } catch (err) {
            console.error("Failed to send message/file", err);
            setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;
        
        setSelectedFile(file);
        const ext = file.name.split('.').pop().toLowerCase();
        if (['jpg','jpeg','png','gif','webp'].includes(ext)) {
            setFilePreview(URL.createObjectURL(file));
        } else {
            setFilePreview(null);
        }
    };

    const cancelFilePreview = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (fileImageRef.current) fileImageRef.current.value = "";
    };

    const confirmDeleteMessage = async (type) => {
        if (!deletingMessageId || String(deletingMessageId).startsWith('temp')) {
            setDeletingMessageId(null);
            return;
        }
        
        const targetId = deletingMessageId;
        if (type === 'everyone') {
            setMessages(prev => prev.map(msg => msg.id === targetId ? {...msg, isDeleted: true} : msg));
        } else {
            setMessages(prev => prev.filter(msg => msg.id !== targetId));
        }
        setDeletingMessageId(null);

        try {
            await api.delete(`/chat/${activeChat.connectionId}/messages/${targetId}?type=${type}`);
        } catch (err) {
            console.error("Failed to delete message:", err);
        }
    };

    const clearChat = async () => {
        if (!activeChat || !window.confirm("Are you sure you want to clear this conversation? This will only affect your view.")) return;
        
        setClearingChat(true);
        try {
            await api.delete(`/chat/${activeChat.connectionId}/clear`);
            setMessages([]);
            setShowMenu(false);
        } catch (err) {
            console.error("Failed to clear chat:", err);
        } finally {
            setClearingChat(false);
        }
    };

    const filteredConversations = conversations.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex h-[calc(100vh-8rem)] overflow-hidden">
            {/* Sidebar: Message List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 flex-col bg-gray-50/50 flex ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Messages</h2>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2.5 bg-gray-100 border-transparent rounded-xl placeholder-gray-400 font-bold focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all shadow-inner focus:shadow-sm"
                            placeholder="Search conversations..."
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm font-bold text-gray-400">Loading connections...</div>
                    ) : filteredConversations.length > 0 ? filteredConversations.map(conv => (
                        <button 
                            key={conv.connectionId}
                            onClick={() => setActiveChat(conv)}
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors flex items-start space-x-3 ${activeChat?.connectionId === conv.connectionId ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 relative uppercase">
                                {conv.picture && conv.picture.startsWith('http') ? (
                                    <img src={conv.picture} alt={conv.name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    conv.name.charAt(0)
                                )}
                                {onlineUsers.has(conv.id) && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate capitalize">{conv.name}</h4>
                                </div>
                                <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                        </button>
                    )) : (
                        <div className="p-6 text-center text-gray-500 text-sm">No active connections found. Start by requesting a mentor.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center z-20">
                            <div className="flex items-center space-x-3">
                                <button className="text-gray-500 hover:text-gray-900 font-bold pr-2 mr-2 border-r border-gray-200 flex items-center transition-colors" onClick={() => setActiveChat(null)}>
                                    &larr; Back
                                </button>
                                <Link to={`/${user?.userType === 'mentor' ? 'mentor/mentee' : 'mentee/mentor'}/${activeChat.id}`} state={{ profile: activeChat.profile }} className="flex items-center space-x-3 text-left hover:opacity-80 transition-opacity focus:outline-none" title="View Profile">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold uppercase overflow-hidden shadow-sm hover:ring-2 ring-primary/30 transition-all">
                                        {activeChat.picture && activeChat.picture.startsWith('http') ? (
                                            <img src={activeChat.picture} alt={activeChat.name} className="h-full w-full object-cover" />
                                        ) : (
                                            activeChat.name.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 capitalize hover:text-primary transition-colors">{activeChat.name}</h3>
                                        <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${onlineUsers.has(activeChat.id) ? 'text-green-500' : 'text-gray-400'}`}>
                                            {onlineUsers.has(activeChat.id) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                            <div className="flex items-center space-x-2 relative">
                                <button 
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                
                                {showMenu && (
                                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button 
                                            onClick={clearChat}
                                            disabled={clearingChat}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            <span>{clearingChat ? 'Clearing...' : 'Clear Conversation'}</span>
                                        </button>
                                        <button 
                                            onClick={() => setShowMenu(false)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                            {messages.map((msg, index) => {
                                const isOwn = msg.senderId === user.id;
                                if (msg.isDeletedByMe) return null; // Added server filter logic check here locally if needed

                                return (
                                    <div key={msg.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group mb-4`}>
                                        {isOwn && !msg.isDeleted && !msg.isOptimistic && (
                                            <button onClick={() => setDeletingMessageId(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 mr-2 text-red-300 hover:text-red-500 transition-opacity h-fit">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm break-words relative overflow-hidden ${
                                            isOwn 
                                                ? 'bg-primary text-white rounded-br-none' 
                                                : 'bg-[#E6F3F5] text-[#b22222] rounded-bl-none shadow-sm'
                                        } ${msg.isDeleted ? 'bg-gray-100 text-gray-400 italic font-medium !border-gray-100 mix-blend-multiply' : ''}`}>
                                            
                                            {msg.fileUrl && !msg.isDeleted ? (
                                                <div className="mb-2 max-w-full">
                                                    {(msg.fileType?.includes('image') || msg.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                                        <div className="relative group/img">
                                                            <img src={msg.fileUrl} alt="attachment" className="rounded-lg max-h-64 h-auto w-full object-cover border border-black/5" />
                                                            <a 
                                                                href={msg.fileUrl} 
                                                                download={msg.fileName || 'image.jpg'} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center space-x-1 text-[10px]"
                                                            >
                                                                <Download size={14} />
                                                                <span>Download</span>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col space-y-2">
                                                            <div className="flex items-center space-x-3 bg-black/5 p-3 rounded-xl border border-black/5">
                                                                <div className="p-2 bg-white/20 rounded-lg text-[#b22222]">
                                                                    <File size={20} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="truncate text-xs font-bold leading-tight">{msg.fileName || 'Document'}</p>
                                                                    <p className="text-[10px] opacity-70 uppercase font-medium">{msg.fileType?.split('/')[1] || 'File'}</p>
                                                                </div>
                                                            </div>
                                                            <a 
                                                                href={msg.fileUrl} 
                                                                download={msg.fileName || 'file'} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                                    isOwn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary text-white hover:bg-primary-dark'
                                                                }`}
                                                            >
                                                                <Download size={14} />
                                                                <span>Download File</span>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}

                                            <span>{msg.isDeleted ? "🚫 This message was deleted" : msg.message}</span>
                                            
                                            <div className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                                {msg.createdAt && (
                                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                )}
                                                {isOwn && !msg.isDeleted && (
                                                    msg.isRead 
                                                       ? <CheckCheck size={14} className="text-[#34B7F1]" /> 
                                                       : (onlineUsers.has(activeChat.id) || !msg.isOptimistic)
                                                          ? <CheckCheck size={14} className="text-white/50" />
                                                          : <Check size={14} className="text-white/30" />
                                                )}
                                            </div>
                                        </div>
                                        {!isOwn && !msg.isDeleted && !msg.isOptimistic && (
                                            <button onClick={() => setDeletingMessageId(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 ml-2 text-red-300 hover:text-red-500 transition-opacity h-fit">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="bg-white border-t border-gray-200 flex flex-col">
                            {selectedFile && (
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-start space-x-4">
                                    <div className="relative inline-block border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm p-1">
                                        {filePreview ? (
                                            <img src={filePreview} alt="Preview" className="h-20 object-contain rounded-lg" />
                                        ) : (
                                            <div className="h-20 w-20 flex flex-col items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                                                <File size={24} className="mb-1" />
                                                <span className="text-[10px] font-bold px-2 truncate max-w-[80px] text-[#b22222]">{selectedFile.name}</span>
                                            </div>
                                        )}
                                        <button type="button" onClick={cancelFilePreview} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black transition-colors">
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <div className="flex flex-col justify-center pt-2">
                                        <span className="text-sm font-bold text-gray-700">File Selected</span>
                                        <span className="text-xs text-gray-400">Add a message or hit send</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-4">
                                <form onSubmit={sendMessage} className="flex items-end space-x-2 relative">
                                    <div className="flex space-x-1 pb-2">
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                        <input type="file" accept="image/*" ref={fileImageRef} onChange={handleFileUpload} className="hidden" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>
                                        <button type="button" onClick={() => fileImageRef.current?.click()} className="p-2 text-gray-400 hover:text-primary transition-colors"><Image size={20} /></button>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            rows={1}
                                            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
                                            placeholder={isSending ? "Sending..." : "Type a message..."}
                                            value={newMessage}
                                            disabled={isSending}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if(!isSending) sendMessage(e);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={(!newMessage.trim() && !selectedFile) || isSending}
                                        className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                                            ((newMessage && newMessage.trim()) || selectedFile) && !isSending ? 'bg-primary text-white shadow-md hover:bg-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Send size={20} className={(newMessage.trim() || selectedFile) ? 'ml-1' : ''} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                        <MessageSquare size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                        <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Deletion Modal Overlay */}
            {deletingMessageId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center transform scale-100 transition-all opacity-100 relative">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Message?</h3>
                        <p className="text-gray-500 text-sm mb-6">Who do you want to delete this message for? This cannot be undone.</p>
                        <div className="flex flex-col space-y-3">
                            {messages.find(m => m.id === deletingMessageId)?.senderId === user?.id && (
                                <button onClick={() => confirmDeleteMessage('everyone')} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">Delete for everyone</button>
                            )}
                            <button onClick={() => confirmDeleteMessage('me')} className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition-colors">Delete for me</button>
                            <button onClick={() => setDeletingMessageId(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default Chat;
