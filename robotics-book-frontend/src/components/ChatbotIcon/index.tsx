import React, {useState, useRef, useEffect, type ReactNode} from 'react';
import styles from './styles.module.css';

// Define the structure of a chat message
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotIcon(): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {text: '👋 Hello! How can I help you with the content of "Physical AI & Humanoid Robotics" today?', sender: 'bot'},
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);
  const closeChat = () => setIsOpen(false);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    // Prevent sending empty messages
    if (!inputValue.trim()) return;

    // Add user's message to the chat
    const userMessage: Message = {text: inputValue, sender: 'user'};
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    console.log("[CHAT] Sending message:", inputValue);
    
    // Dynamic API URL based on environment
    // Local: points to the standalone Express server on port 3001
    // Production: points to the relative Vercel serverless function
    const isDevelopment = process.env.NODE_ENV === 'development';
    const apiUrl = isDevelopment ? 'http://localhost:3001/api/chat' : '/api/chat';
    
    console.log("[CHAT] Environment:", process.env.NODE_ENV);
    console.log("[CHAT] Resolved API URL:", apiUrl);

    try {
      // API call to the backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: inputValue}),
      });

      console.log("[CHAT] Response status:", response.status);

      // Read text first to debug non-JSON responses
      const rawText = await response.text();
      console.log("[CHAT] Raw response:", rawText);

      // Check content type to ensure we got JSON back (avoids crashing on 404/500 HTML pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error(`Received non-JSON response: ${response.status} ${response.statusText}`);
      }

      const data = JSON.parse(rawText);
      console.log("[CHAT] Parsed JSON:", data);

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.statusText}`);
      }

      // Add bot's response to the chat
      const botMessage: Message = {text: data.reply || "I didn't get a response.", sender: 'bot'};
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Chatbot API Error:", error);
      
      let errorMsg = "AI service is temporarily unavailable. Please try again.";
      // Detect if it's a network error (server down)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMsg = "Cannot connect to AI server. Is the backend running on port 3001?";
      }
      
      const errorMessage: Message = {
        text: errorMsg,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow sending with the "Enter" key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <div className={styles.chatbotContainer}>
        <button
          className={styles.chatbotButton}
          title="Chat with AI Assistant"
          onClick={toggleChat}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.chatIcon}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        </button>
        <div className={styles.tooltip}>Chat with AI</div>
      </div>

      {isOpen && (
        <div className={styles.chatModal}>
          <div className={styles.chatHeader}>
            <h3>Chat with AI Assistant</h3>
            <button
              className={styles.closeButton}
              onClick={closeChat}
              title="Close"
            >
              ✕
            </button>
          </div>
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <p className={styles.loadingDots}>
                  <span>.</span><span>.</span><span>.</span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
