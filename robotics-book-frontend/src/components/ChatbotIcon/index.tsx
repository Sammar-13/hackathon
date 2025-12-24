import React, {useState, useRef, useEffect, type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

// Define the structure of a chat message
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotIcon(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
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

    // Configuration for API URL - supports Docusaurus customFields or localhost default
    const API_BASE = (siteConfig.customFields?.apiUrl as string) || 'http://localhost:8000';
    const targetUrl = `${API_BASE}/api/chat`;
    const payload = { message: inputValue };

    console.log(`[CHAT] 🚀 Sending to: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const botMessage: Message = {text: data.reply, sender: 'bot'};
      setMessages((prev) => [...prev, botMessage]);

    } catch (error: any) {
      console.error("[CHAT] Fetch Error:", error);
      let msg = "Could not connect to the AI.";
      
      if (error.message && typeof error.message === 'string' && error.message.includes("Failed to fetch")) {
        msg = "Network Error: Is the backend server running?";
      }

      setMessages((prev) => [...prev, { text: `Error: ${msg}`, sender: 'bot' }]);
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