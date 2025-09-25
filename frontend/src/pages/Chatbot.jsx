import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm your AI Security Assistant. I can help you understand vulnerabilities, security threats, and provide guidance on best practices. How can I assist you today?",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modalCve, setModalCve] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [typedText, setTypedText] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_history");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert ISO strings back to Date objects and filter out file messages
        const textMessages = parsedMessages
          .filter((msg) => !msg.file)
          .map((msg) => ({
            ...msg,
            ts: new Date(msg.ts),
          }));
        if (textMessages.length > 0) {
          setMessages(textMessages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    // Create a copy of messages without file blob URLs for persistence
    const messagesToSave = messages
      .map((msg) => {
        if (msg.file) {
          // Don't persist file messages with blob URLs
          return null;
        }
        return {
          ...msg,
          ts: msg.ts.toISOString(), // Convert Date to string for JSON
        };
      })
      .filter(Boolean);

    if (messagesToSave.length > 0) {
      localStorage.setItem("chat_history", JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc to close modal
      if (e.key === "Escape" && modalCve) {
        setModalCve(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalCve]);

  // Cleanup typing animation on unmount
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = {
        id: Date.now(),
        sender: "user",
        text: input.trim(),
        ts: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      // Simulate bot response
      setTimeout(() => {
        const botMessageText =
          "Thanks for your question! I'm analyzing your request and will provide you with detailed security insights. This is a simulated response for now.";
        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text: botMessageText,
          ts: new Date(),
          isTyping: true,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        // Start typing animation
        typeMessage(botMessage.id, botMessageText, () => {
          // Mark message as fully typed when done
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessage.id ? { ...msg, isTyping: false } : msg
            )
          );
        });
      }, 800);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const quickPrompts = [
    "Most critical vuln for example.com",
    "Show attack path to DB",
    "How to patch CVE-2024-12345",
  ];

  // Helper to check if two dates are on different days
  const isDifferentDay = (date1, date2) => {
    return date1.toDateString() !== date2.toDateString();
  };

  // Helper to format date for separator
  const formatDateSeparator = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const renderMessageText = (text) => {
    const cveRegex = /CVE-\d{4}-\d{4,7}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = cveRegex.exec(text)) !== null) {
      // Add text before the CVE
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the CVE as a clickable link
      const cveId = match[0];
      parts.push(
        <button
          key={`${cveId}-${match.index}`}
          onClick={(e) => {
            e.preventDefault();
            setModalCve(cveId);
          }}
          className="underline hover:text-blue-300 transition-colors cursor-pointer"
        >
          {cveId}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last CVE
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    // Use setTimeout to ensure the input state is updated before sending
    setTimeout(() => {
      const userMessage = {
        id: Date.now(),
        sender: "user",
        text: prompt,
        ts: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      // Simulate bot response
      setTimeout(() => {
        const botMessageText =
          "Thanks for your question! I'm analyzing your request and will provide you with detailed security insights. This is a simulated response for now.";
        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text: botMessageText,
          ts: new Date(),
          isTyping: true,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        // Start typing animation
        typeMessage(botMessage.id, botMessageText, () => {
          // Mark message as fully typed when done
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessage.id ? { ...msg, isTyping: false } : msg
            )
          );
        });
      }, 800);
    }, 0);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const fileMessage = {
        id: Date.now(),
        sender: "user",
        file: {
          name: file.name,
          size: file.size,
          url: blobUrl,
        },
        ts: new Date(),
      };

      setMessages((prev) => [...prev, fileMessage]);

      // Clear the file input
      event.target.value = "";

      // Simulate bot response to file
      setIsTyping(true);
      setTimeout(() => {
        const botMessageText = `I've received your file "${file.name}". File analysis capabilities are not implemented yet, but I can help you with security questions about it.`;
        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text: botMessageText,
          ts: new Date(),
          isTyping: true,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        // Start typing animation
        typeMessage(botMessage.id, botMessageText, () => {
          // Mark message as fully typed when done
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessage.id ? { ...msg, isTyping: false } : msg
            )
          );
        });
      }, 800);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const typeMessage = (messageId, fullText, callback) => {
    let currentIndex = 0;
    setTypingMessageId(messageId);
    setTypedText("");

    const typeNextChunk = () => {
      if (currentIndex < fullText.length) {
        // Type in chunks of 1-3 characters for more natural flow
        const chunkSize = Math.random() < 0.7 ? 1 : Math.random() < 0.8 ? 2 : 3;
        const nextIndex = Math.min(currentIndex + chunkSize, fullText.length);

        setTypedText(fullText.slice(0, nextIndex));
        currentIndex = nextIndex;

        // Variable delay: faster for normal characters, slower for punctuation
        const currentChar = fullText[currentIndex - 1];
        let delay = 20 + Math.random() * 30; // Base 20-50ms

        if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          delay += 100 + Math.random() * 200; // Pause after sentences
        } else if (
          currentChar === "," ||
          currentChar === ";" ||
          currentChar === ":"
        ) {
          delay += 50 + Math.random() * 100; // Short pause after commas
        } else if (currentChar === " ") {
          delay += 10 + Math.random() * 20; // Slight pause between words
        }

        typingIntervalRef.current = setTimeout(typeNextChunk, delay);
      } else {
        setTypingMessageId(null);
        setTypedText("");
        if (callback) callback();
      }
    };

    typeNextChunk();
  };

  const stopTyping = () => {
    if (typingIntervalRef.current) {
      clearTimeout(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setTypingMessageId(null);
    setTypedText("");
  };

  const handleCopyMessage = async (message) => {
    try {
      const textToCopy = message.file
        ? `File: ${message.file.name} (${formatFileSize(message.file.size)})`
        : message.text;

      await navigator.clipboard.writeText(textToCopy);
      setCopiedMessageId(message.id);

      // Hide the "Copied!" toast after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const CVEModal = ({ cveId, onClose }) => {
    if (!cveId) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{cveId}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="text-gray-300 mb-4">
            <p>Fetching CVE details...</p>
          </div>

          <div className="flex gap-3">
            <a
              href={`https://nvd.nist.gov/vuln/detail/${cveId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in NVD
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-card border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">
          🤖 AI Security Assistant
        </h1>
      </header>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="flex flex-col space-y-4 items-stretch max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const showDateSeparator =
              index === 0 ||
              (index > 0 && isDifferentDay(messages[index - 1].ts, message.ts));

            return (
              <div key={message.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4 animate-in fade-in duration-500">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-3 text-xs text-gray-400 bg-gray-900">
                      {formatDateSeparator(message.ts)}
                    </span>
                    <div className="flex-1 border-t border-gray-600"></div>
                  </div>
                )}

                {/* Message */}
                <div
                  className={`flex flex-col max-w-xs ${
                    message.sender === "user" ? "ml-auto" : "mr-auto"
                  } group animate-in fade-in slide-in-from-bottom-4 duration-300`}
                >
                  <div className="relative">
                    {message.file ? (
                      // File message
                      <div
                        className={`p-3 rounded-lg border-2 border-dashed ${
                          message.sender === "user"
                            ? "bg-accent text-white border-white/20"
                            : "bg-gray-800 text-gray-200 border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span className="font-medium">
                            {message.file.name}
                          </span>
                        </div>
                        <div className="text-sm opacity-75 mb-2">
                          {formatFileSize(message.file.size)}
                        </div>
                        <a
                          href={message.file.url}
                          download={message.file.name}
                          className="inline-flex items-center gap-1 text-sm underline hover:no-underline"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Download
                        </a>
                      </div>
                    ) : (
                      // Text message
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-accent text-white"
                            : "bg-gray-800 text-gray-200"
                        }`}
                      >
                        {message.sender === "bot" &&
                        message.isTyping &&
                        typingMessageId === message.id ? (
                          <span>
                            {renderMessageText(typedText)}
                            <span className="animate-pulse">|</span>
                          </span>
                        ) : (
                          renderMessageText(message.text)
                        )}
                      </div>
                    )}

                    {/* Copy button - appears on hover */}
                    <button
                      onClick={() => handleCopyMessage(message)}
                      className={`absolute -top-2 ${
                        message.sender === "user" ? "-left-8" : "-right-8"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 hover:text-white`}
                      aria-label="Copy message"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>

                    {/* Copied toast */}
                    {copiedMessageId === message.id && (
                      <div
                        className={`absolute -top-8 ${
                          message.sender === "user" ? "right-0" : "left-0"
                        } bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg`}
                      >
                        Copied!
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-1 px-1">
                    {message.ts.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex flex-col max-w-xs self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-3 rounded-lg bg-gray-800 text-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section - Fixed at bottom */}
      <div className="flex-shrink-0 px-6 py-4 bg-card border-t border-gray-700">
        {/* Quick Prompts */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isTyping}
                className="rounded px-3 py-1 bg-gray-800 text-gray-200 hover:bg-gray-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Row */}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="flex-1 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about security vulnerabilities... (Ctrl+K to focus)"
              aria-label="Ask security assistant"
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping}
              aria-label="Attach file"
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            onClick={handleSend}
            aria-label="Send message"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select file to upload"
        />
      </div>

      {/* CVE Modal */}
      <CVEModal cveId={modalCve} onClose={() => setModalCve(null)} />
    </div>
  );
}
