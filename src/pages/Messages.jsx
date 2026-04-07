import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, User, MessageSquare, MoreVertical, Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useNotifications } from '../hooks/useNotifications';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { onlineUsers } = useNotifications();

  const currentUser = api.getUser();

  const isOnline = (userId) => onlineUsers.includes(String(userId));

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [recentConv, allUsers] = await Promise.all([
          api.getRecentConversations(),
          api.getUsers()
        ]);
        setConversations(recentConv);
        setUsers(allUsers);
        
        const userIdFromUrl = searchParams.get('user');
        if (userIdFromUrl) {
          const user = allUsers.find(u => u.id === userIdFromUrl);
          if (user) setSelectedUser(user);
        } else if (recentConv.length > 0) {
          const firstConvPartner = allUsers.find(u => u.id === recentConv[0]._id);
          if (firstConvPartner) setSelectedUser(firstConvPartner);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    if (selectedUser) {
      const loadConversation = async () => {
        try {
          const data = await api.getConversation(selectedUser.id);
          setMessages(data);
        } catch (err) {
          console.error('Error loading conversation:', err);
        } finally {
          setLoadingConvo(false);
        }
      };
      
      setLoadingConvo(true);
      loadConversation();
      
      const interval = setInterval(loadConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      const sentMsg = await api.sendMessage(selectedUser.id, newMessage);
      setMessages(prev => [...prev, sentMsg]);
      setNewMessage('');
      
      const existingConvIndex = conversations.findIndex(c => c._id === selectedUser.id);
      if (existingConvIndex > -1) {
        const updatedConvs = [...conversations];
        updatedConvs[existingConvIndex] = {
          ...updatedConvs[existingConvIndex],
          lastMessage: sentMsg.content,
          timestamp: sentMsg.timestamp
        };
        setConversations(updatedConvs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } else {
        setConversations([{
          _id: selectedUser.id,
          lastMessage: sentMsg.content,
          timestamp: sentMsg.timestamp,
          unread: 0
        }, ...conversations]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getPartnerInfo = (userId) => {
    return users.find(u => u.id === userId) || { name: 'Unknown User', avatar: '?' };
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="messages-layout animate-fade-in p-xl">
      {/* Sidebar */}
      <div className="messages-sidebar chart-card p-0 overflow-hidden">
        <div className="p-xl border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 className="mb-lg">Messages</h2>
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search conversations..." />
          </div>
        </div>
        <div className="conversations-list overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-2xl text-center text-secondary text-sm">
              No recent conversations
            </div>
          ) : (
            conversations.map((conv, i) => {
              const partner = getPartnerInfo(conv._id);
              return (
                <div 
                  key={conv._id} 
                  className={`conversation-item ${selectedUser?.id === conv._id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(partner)}
                  style={{ padding: 'var(--space-lg)' }}
                >
                  <div className="team-avatar relative" style={{ background: `hsl(${i * 60 + 200}, 70%, 60%)`, width: '48px', height: '48px' }}>
                    {partner.avatar || partner.name[0]}
                    {/* Presence Indicator */}
                    {isOnline(partner.id) && (
                      <span className="presence-dot-pulsing" style={{ border: '2px solid var(--bg-secondary)', width: '12px', height: '12px' }} title="Online now"></span>
                    )}
                  </div>
                  <div className="conversation-info ml-md flex-1">
                    <div className="flex justify-between items-center mb-xs">
                      <span className="font-semibold">{partner.name}</span>
                      <span className="text-xs text-secondary">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="conversation-last-msg text-sm text-secondary truncate" style={{ maxWidth: '180px' }}>{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && <div className="unread-dot"></div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="chat-container chart-card p-0 ml-xl overflow-hidden flex flex-col">
        {selectedUser ? (
          <>
            <div className="chat-header p-xl border-b flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-md">
                <button className="btn-icon-sm lg-hidden" onClick={() => setSelectedUser(null)}><ArrowLeft size={18} /></button>
                <div className="team-avatar relative" style={{ background: `hsl(200, 70%, 60%)`, width: '52px', height: '52px' }}>
                  {selectedUser.avatar || selectedUser.name[0]}
                  {isOnline(selectedUser.id) && (
                    <span className="presence-dot-pulsing" style={{ border: '2px solid var(--bg-secondary)', width: '14px', height: '14px' }} title="Online now"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedUser.name}</div>
                  <div className={`text-xs ${isOnline(selectedUser.id) ? 'text-success font-semibold' : 'text-secondary'}`}>
                    {isOnline(selectedUser.id) ? 'Online Now' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="flex gap-md">
                <button className="btn-icon-sm"><Phone size={18} /></button>
                <button className="btn-icon-sm"><Video size={18} /></button>
                <button className="btn-icon-sm"><Info size={18} /></button>
              </div>
            </div>

            <div className="chat-body p-xl flex-1 overflow-y-auto">
              {loadingConvo ? (
                <div className="flex-1 flex items-center justify-center h-full"><div className="spinner"></div></div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50 h-full">
                  <MessageSquare size={48} className="mb-md" />
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={m.id || i} className={`message-row ${m.senderId === currentUser.id ? 'sent' : 'received'} mb-lg`}>
                    <div className="message-bubble p-lg" style={{ borderRadius: 'var(--radius-lg)', maxWidth: '70%' }}>
                      {m.content}
                      <div className="message-time text-xs mt-xs opacity-60">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer p-xl border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <form className="chat-input-wrapper flex gap-md" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  className="chat-input flex-1 p-md glass" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoFocus
                  style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}
                />
                <button type="submit" className="btn btn-primary btn-icon" style={{ height: '48px', width: '48px' }} disabled={!newMessage.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-3xl h-full">
            <div className="stat-card-icon" style={{ width: '80px', height: '80px', fontSize: '2rem', background: 'var(--bg-glass)', marginBottom: 'var(--space-xl)' }}>💬</div>
            <h2 className="mb-md">Your Conversations</h2>
            <p className="text-secondary mb-xl">Select a conversation or a team member to start chatting.</p>
            <button className="btn btn-primary" onClick={() => navigate('/team')}>Go to Team</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
