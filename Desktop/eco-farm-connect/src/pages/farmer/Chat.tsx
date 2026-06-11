import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockInquiries, mockChatMessages, quickReplies } from '../../data/mockData';

export const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { inquiryId } = useParams();
  const [messages, setMessages] = useState(mockChatMessages[inquiryId || 'inq-1'] || []);
  const [newMessage, setNewMessage] = useState('');

  const inquiry = mockInquiries.find(i => i.id === inquiryId) || mockInquiries[0];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      senderId: 'farmer-1',
      senderName: 'Nguyễn Văn An',
      content: newMessage,
      isAI: false,
      timestamp: new Date().toISOString(),
    }]);
    setNewMessage('');
  };

  const handleQuickReply = (text: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      senderId: 'farmer-1',
      senderName: 'Nguyễn Văn An',
      content: text,
      isAI: false,
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <div className="mobile-container h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('/farmer/inquiries')} className="text-gray-500">←</button>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
          {inquiry.buyerName.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{inquiry.buyerName}</p>
          <p className="text-xs text-gray-400">{inquiry.listingTitle}</p>
        </div>
        <button className="text-gray-400">
          <span className="text-xl">⋮</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => {
          const isFarmer = msg.senderId === 'farmer-1' || msg.senderId === 'system';
          return (
            <div key={msg.id} className={`flex ${isFarmer ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isFarmer ? 'order-1' : 'order-1'}`}>
                {msg.isAI && (
                  <p className="text-[10px] text-gray-400 mb-1 text-center">💡 Gợi ý AI</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  msg.isAI
                    ? 'bg-yellow-50 border border-yellow-200 text-gray-700'
                    : isFarmer
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] text-gray-300 mt-1 ${isFarmer ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleQuickReply(reply)}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 whitespace-nowrap hover:bg-gray-200 flex-shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="text-gray-400 text-xl p-1">➕</button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm outline-none focus:bg-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};
