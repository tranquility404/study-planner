import { Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { chatBot } from '../api/apiRequests';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotOverlayProps {
  width?: string;
  height?: string;
  position?: 'bottom-right' | 'bottom-left';
  title?: string;
  apiEndpoint?: string;
  botIntro?: string;
  theme?: 'light' | 'dark';
}

const ChatBotOverlay: React.FC<ChatBotOverlayProps> = ({
  width = 'w-80',
  height = 'h-96',
  position = 'bottom-right',
  title = 'Chat Assistant',
  apiEndpoint = '/api/chat',
  botIntro = "Hello! 👋 I'm your assistant. Ask me anything about your timetable or schedule!",
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: botIntro,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with your actual endpoint call
      // const response = await fetch(apiEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: inputMessage })
      // });
      // const data = await response.json();
      
      // Simulated response after a short delay
      
      const res = await chatBot(inputMessage);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: res.data,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple bot response generator for demo purposes
  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
      return 'Hello there! How can I help with your timetable today?';
    }
    
    if (message.includes('timetable') || message.includes('schedule')) {
      return 'Your next class is Advanced Mathematics at 2:00 PM in Room 302. Would you like to see your full schedule?';
    }
    
    if (message.includes('time') || message.includes('when')) {
      return 'According to your schedule, you have free time between 3:30 PM and 5:00 PM today.';
    }
    
    if (message.includes('help')) {
      return 'I can help you check your class schedule, find free slots in your timetable, or remind you about upcoming deadlines. What would you like to know?';
    }
    
    return "I'm not sure I understand. Could you ask about your timetable or schedule specifically?";
  };

  const positionClass = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';
    
  const themeClasses = theme === 'dark' 
    ? 'bg-gray-800 text-gray-100' 
    : 'bg-white text-gray-800';

  return (
    <div className={`fixed ${positionClass} z-50 flex flex-col`}>
      {/* Chat button when closed */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`${themeClasses} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </button>
      )}
      
      {/* Chat window when open */}
      {isOpen && (
        <div className={`${themeClasses} ${width} ${height} rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-300`}>
          {/* Header */}
          <div className="px-4  bg-blue-500 text-white flex justify-between items-center">
            <h3 className="font-medium">{title}</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-full hover:bg-blue-600 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div 
            className="flex-1 p-4 overflow-y-auto" 
            ref={chatContainerRef}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : theme === 'light' 
                        ? 'bg-gray-100 text-gray-800 rounded-bl-none' 
                        : 'bg-gray-700 text-white rounded-bl-none'
                  }`}
                >
                  {msg.content}
                  <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className={`px-4 py-2 rounded-lg max-w-xs rounded-bl-none ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className={`flex-1 px-4 py-2 rounded-l-lg focus:outline-none ${
                theme === 'light' 
                  ? 'bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-200' 
                  : 'bg-gray-700 text-white focus:ring-2 focus:ring-blue-600'
              }`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 py-2 rounded-r-lg bg-blue-500 text-white ${
                isLoading || !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBotOverlay;

// Demo application wrapper
// const App = () => {
//   return (
//     <div className="w-full h-screen bg-gray-100 p-4">
//       <h1 className="text-2xl font-bold mb-4">Your Application</h1>
//       <p className="mb-2">This is your main application content.</p>
//       <p>The chat overlay will appear in the bottom right corner.</p>
      
//       <ChatBotOverlay 
//         width="w-80" 
//         height="h-96" 
//         position="bottom-right"
//         title="Timetable Assistant"
//         botIntro="Hello! 👋 I'm your timetable assistant. Ask me anything about your classes or schedule!"
//         theme="light"
//       />
//     </div>
//   );
// };

// // Default export for the component
// export default App;