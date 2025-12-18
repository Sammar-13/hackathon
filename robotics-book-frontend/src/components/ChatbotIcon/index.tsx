import type {ReactNode} from 'react';
import {useState} from 'react';
import styles from './styles.module.css';

export default function ChatbotIcon(): ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
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
            <div className={styles.message}>
              <p>👋 Hello! How can I help you with robotics today?</p>
            </div>
          </div>
          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder="Ask a question..."
              disabled
            />
            <button disabled>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
