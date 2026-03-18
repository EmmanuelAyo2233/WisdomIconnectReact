import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Search, Send, Clock, MoreVertical, Image, Paperclip, MessageSquare } from 'lucide-react';
import api from '../api/axios';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Mock fetching contacts/connections
    setConversations([
      { id: 1, userId: 101, firstName: 'Ade', lastName: 'Olu', role: 'mentor', lastMessage: 'Looking forward to our session!', lastMessageTime: '10:30 AM', unread: 2 },
      { id: 2, userId: 102, firstName: 'Sarah', lastName: 'Williams', role: 'mentor', lastMessage: 'Here is the link to the resource.', lastMessageTime: 'Yesterday', unread: 0 },
    ]);
  }, []);

  useEffect(() => {
     if (activeChat) {
        // Mock fetching previous messages
        setMessages([
           { id: 1, senderId: 101, receiverId: user.id, message: 'Hello! How can I help you today?', timestamp: new Date(Date.now() - 3600000).toISOString() },
           { id: 2, senderId: user.id, receiverId: 101, message: 'Hi! I wanted to check if you have any resources on backend architecture.', timestamp: new Date(Date.now() - 3500000).toISOString() },
           { id: 3, senderId: 101, receiverId: user.id, message: 'Looking forward to our session!', timestamp: new Date(Date.now() - 3400000).toISOString() },
        ]);
     }
  }, [activeChat, user.id]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (activeChat && (message.senderId === activeChat.userId || message.senderId === user.id)) {
           setMessages((prev) => [...prev, message]);
        }
      });
    }
    return () => {
      if (socket) socket.off('receive_message');
    };
  }, [socket, activeChat, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      senderId: user.id,
      receiverId: activeChat.userId,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');

    if (socket) {
       socket.emit('send_message', messageData);
    }
    // Also save to DB via API
    try {
       // await api.post('/chat/messages', { receiverId: activeChat.userId, message: messageData.message });
    } catch(err) {
       console.error("Failed to save message", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex h-[calc(100vh-8rem)] overflow-hidden">
      
      {/* Sidebar: Message List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
         <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-gray-400" />
               </div>
               <input
                 type="text"
                 className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                 placeholder="Search conversations..."
               />
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
               <button 
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors flex items-start space-x-3 ${activeChat?.id === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
               >
                  <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 relative">
                     {conv.firstName.charAt(0)}{conv.lastName.charAt(0)}
                     <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{conv.firstName} {conv.lastName}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{conv.lastMessageTime}</span>
                     </div>
                     <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                     </p>
                  </div>
                  {conv.unread > 0 && (
                     <div className="h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                        {conv.unread}
                     </div>
                  )}
               </button>
            ))}
         </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex col flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
         {activeChat ? (
            <>
               {/* Chat Header */}
               <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center z-10">
                  <div className="flex items-center space-x-3">
                     <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setActiveChat(null)}>
                        &larr; Back
                     </button>
                     <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {activeChat.firstName.charAt(0)}{activeChat.lastName.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-900">{activeChat.firstName} {activeChat.lastName}</h3>
                        <p className="text-xs text-green-600 font-medium">Online</p>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                     <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><MoreVertical size={20} /></button>
                  </div>
               </div>

               {/* Messages Stream */}
               <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                  {messages.map((msg, index) => {
                     const isOwn = msg.senderId === user.id;
                     return (
                        <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              isOwn 
                                 ? 'bg-primary text-white rounded-br-none' 
                                 : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                           }`}>
                              {msg.message}
                              <div className={`text-[10px] mt-1 text-right ${isOwn ? 'text-primary-light' : 'text-gray-400'}`}>
                                 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                        </div>
                     )
                  })}
                  <div ref={messagesEndRef} />
               </div>

               {/* Message Input */}
               <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex items-end space-x-2">
                     <div className="flex space-x-1 pb-2">
                        <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>
                        <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><Image size={20} /></button>
                     </div>
                     <div className="flex-1">
                        <textarea
                           rows={1}
                           className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
                           placeholder="Type a message..."
                           value={newMessage}
                           onChange={(e) => setNewMessage(e.target.value)}
                           onKeyDown={(e) => {
                              if(e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault();
                                 sendMessage(e);
                              }
                           }}
                        />
                     </div>
                     <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                           newMessage.trim() ? 'bg-primary text-white hover:bg-primary-dark shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                     >
                        <Send size={20} className={newMessage.trim() ? 'ml-1' : ''} />
                     </button>
                  </form>
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

    </div>
  );
};

export default Chat;
