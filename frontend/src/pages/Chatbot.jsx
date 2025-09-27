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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState("General");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Context options for dropdown
  const contextOptions = [
    "General",
    "Last Scan Results",
    "Critical Vulnerabilities",
    "Network Security",
    "Web Application Security",
  ];

  // Quick action prompts
  const quickActions = [
    {
      id: 1,
      title: "Explain CVE",
      prompt: "Explain what CVE-2024-12345 is and how to mitigate it",
    },
    {
      id: 2,
      title: "Security Best Practices",
      prompt:
        "What are the top 10 security best practices for web applications?",
    },
    {
      id: 3,
      title: "Vulnerability Assessment",
      prompt:
        "How should I prioritize the vulnerabilities found in my latest scan?",
    },
    {
      id: 4,
      title: "Incident Response",
      prompt: "What steps should I take if I suspect a security breach?",
    },
    {
      id: 5,
      title: "Compliance Check",
      prompt:
        "What security compliance frameworks should I consider for my organization?",
    },
    {
      id: 6,
      title: "Risk Analysis",
      prompt:
        "How do I perform a proper risk analysis for identified vulnerabilities?",
    },
    {
      id: 7,
      title: "Patch Management",
      prompt: "What's the best strategy for managing security patches?",
    },
    {
      id: 8,
      title: "Network Monitoring",
      prompt:
        "What tools and techniques should I use for continuous network monitoring?",
    },
  ];

  // Get contextual response based on selected context
  const getContextualResponse = (prompt, context) => {
    const baseResponses = {
      "Explain CVE": `Based on ${context} context: CVE-2024-12345 is a critical SQL injection vulnerability affecting web applications. It allows attackers to manipulate database queries through unsanitized input fields. Mitigation includes input validation, parameterized queries, and regular security updates.`,
      "Security Best Practices": `For ${context}: Key practices include input validation, authentication mechanisms, encryption of sensitive data, regular updates, access controls, logging, network segmentation, backup strategies, incident response plans, and security awareness training.`,
      "Vulnerability Assessment": `In ${context} scope: Prioritize by CVSS score, exploitability, business impact, and asset criticality. Focus on Critical (9.0+) and High (7.0-8.9) severity issues first, especially those affecting public-facing systems.`,
      "Incident Response": `For ${context} incidents: 1) Contain the threat, 2) Assess impact, 3) Preserve evidence, 4) Notify stakeholders, 5) Eradicate threats, 6) Recover systems, 7) Document lessons learned, 8) Update security measures.`,
      "Compliance Check": `Relevant to ${context}: Consider SOC 2, ISO 27001, PCI DSS (for payments), HIPAA (healthcare), GDPR (EU data), NIST Framework, and industry-specific regulations. Regular audits ensure ongoing compliance.`,
      "Risk Analysis": `In ${context} environment: Use qualitative and quantitative methods. Assess likelihood vs impact, consider threat landscape, evaluate existing controls, calculate residual risk, and develop mitigation strategies.`,
      "Patch Management": `For ${context} systems: Establish regular update cycles, test patches in staging environments, prioritize critical security updates, maintain inventory of systems, automate where possible, and have rollback procedures.`,
      "Network Monitoring": `In ${context} networks: Deploy SIEM tools, use intrusion detection systems, implement log analysis, monitor traffic patterns, set up alerts for anomalies, conduct regular vulnerability scans, and maintain network topology visibility.`,
    };

    // Find matching response based on prompt keywords
    for (const [key, response] of Object.entries(baseResponses)) {
      if (
        prompt.toLowerCase().includes(key.toLowerCase().replace(/\s+/g, " "))
      ) {
        return response;
      }
    }

    // Default contextual response
    return `Thanks for your question about "${prompt}". In the context of ${context}, I'm analyzing your request and providing security insights. This is a simulated response that takes into account your selected scan context and security domain.`;
  };

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
      }, 200);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

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
            // If a typing animation is active, finalize it immediately to avoid UI glitches
            if (typingMessageId) {
              stopTyping();
              // mark the typing message as finished so full text renders
              setMessages((prev) =>
                prev.map((m) => (m.id === typingMessageId ? { ...m, isTyping: false } : m))
              );
            }
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
        const botMessageText = getContextualResponse(prompt, selectedContext);
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
      }, 200);
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
      }, 200);
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
        let delay = 10 + Math.random() * 15; // Base 10-25ms (faster)

        if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          delay += 50 + Math.random() * 100; // Pause after sentences (reduced)
        } else if (
          currentChar === "," ||
          currentChar === ";" ||
          currentChar === ":"
        ) {
          delay += 25 + Math.random() * 50; // Short pause after commas (reduced)
        } else if (currentChar === " ") {
          delay += 5 + Math.random() * 10; // Slight pause between words (reduced)
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
    const closeBtnRef = useRef(null);

    // Prevent background scroll while modal is open and focus close button
    useEffect(() => {
      if (!cveId) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => closeBtnRef.current?.focus?.(), 50);
      return () => {
        document.body.style.overflow = prev;
      };
    }, [cveId]);

    if (!cveId) return null;

    const handleBackdropClick = () => onClose();

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${cveId}`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{cveId}</h3>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors focus:outline-none"
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
              href={`https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cveId)}`}
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              aria-label="Toggle quick actions panel"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">
              🤖 AI Security Assistant
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="context-select" className="text-sm text-gray-300">
              Context:
            </label>
            <select
              id="context-select"
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {contextOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Quick Actions Panel */}
        <div
          className={`${
            isPanelOpen ? "w-80" : "w-0"
          } transition-all duration-300 bg-gray-800 border-r border-gray-700 overflow-hidden flex-shrink-0`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickPrompt(action.prompt)}
                  className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors text-sm"
                  disabled={isTyping}
                >
                  <div className="font-medium text-blue-300 mb-1">
                    {action.title}
                  </div>
                  <div className="text-gray-400 text-xs truncate">
                    {action.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
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
                  (index > 0 &&
                    isDifferentDay(messages[index - 1].ts, message.ts));

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
                      className={`flex flex-col ${
                        message.sender === "user"
                          ? "ml-auto items-end"
                          : "mr-auto items-start"
                      } group animate-in fade-in slide-in-from-bottom-4 duration-300`}
                    >
                      <div className="relative">
                        {message.file ? (
                          // File message
                          <div
                            className={`p-3 rounded-lg border-2 border-dashed max-w-[70vw] w-fit ${
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
                            className={`p-3 rounded-lg max-w-[70vw] w-fit ${
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
                <div className="flex flex-col self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-3 rounded-lg bg-gray-800 text-gray-200 w-fit">
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
        </div>
      </div>

      {/* CVE Modal */}
      <CVEModal cveId={modalCve} onClose={() => setModalCve(null)} />
    </div>
  );
}
