import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import { getMyConversations, getMessages, sendMessage } from '../services/messageService';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import { format } from 'date-fns';

const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [activeConv, setActiveConv] = useState(conversationId || null);

  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await getMyConversations()).data,
    refetchInterval: 10000,
  });

  const conversations = convsData?.conversations || [];

  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', activeConv],
    queryFn: async () => activeConv ? (await getMessages(activeConv)).data : null,
    enabled: !!activeConv,
    refetchInterval: 5000,
  });

  const messages = msgsData?.messages || [];

  const sendMutation = useMutation({
    mutationFn: (content) => sendMessage(activeConv, { content }),
    onSuccess: () => {
      setMessage('');
      qc.invalidateQueries(['messages', activeConv]);
      qc.invalidateQueries(['conversations']);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId) setActiveConv(conversationId);
  }, [conversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeConv) return;
    sendMutation.mutate(message.trim());
  };

  const activeConvData = conversations.find((c) => c._id === activeConv);
  const otherParticipant = activeConvData?.participants?.find((p) => p._id !== user?._id);

  return (
    <div className="pt-16 h-screen flex overflow-hidden bg-dark-800">
      {/* Conversations list */}
      <aside className={`w-full md:w-72 border-r border-dark-700/50 flex flex-col bg-dark-700/30 ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-dark-700/50">
          <h2 className="font-bold text-dark-50">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FiMessageCircle className="mx-auto mb-3 text-dark-600" size={32} />
              <p className="text-dark-500 text-sm">No conversations yet</p>
              <p className="text-dark-600 text-xs mt-1">Contact someone about an item to start chatting</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find((p) => p._id !== user?._id);
              return (
                <button
                  key={conv._id}
                  onClick={() => { setActiveConv(conv._id); navigate(`/messages/${conv._id}`); }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-dark-600/30 transition-colors border-b border-dark-700/30 text-left ${activeConv === conv._id ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {other?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-100 text-sm truncate">{other?.name || 'User'}</p>
                    <p className="text-dark-500 text-xs truncate mt-0.5">{conv.lastMessage || 'Start conversation'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiMessageCircle className="mx-auto mb-4 text-dark-600" size={48} />
              <p className="text-dark-400">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-dark-700/50 flex items-center gap-3 bg-dark-700/30">
              <button onClick={() => { setActiveConv(null); navigate('/messages'); }} className="md:hidden text-dark-400 mr-1">←</button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-dark-50 text-sm">{otherParticipant?.name || 'User'}</p>
                {activeConvData?.item && (
                  <p className="text-dark-500 text-xs">Re: {activeConvData.item.title}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-dark-500 text-sm">No messages yet. Say hello!</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-dark-700 text-dark-100 rounded-bl-sm'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-dark-500'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-dark-700/50 flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
                id="chat-message-input"
              />
              <button type="submit" disabled={!message.trim() || sendMutation.isPending} className="btn btn-primary px-4" id="send-message-btn">
                {sendMutation.isPending ? <Spinner size="sm" /> : <FiSend size={18} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
