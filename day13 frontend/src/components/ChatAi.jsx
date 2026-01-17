import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    // Initializing the chat with the model's welcome message
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi! I'm your DSA assistant. How can I help you with this problem?" }] }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when a new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        // Construct the new user message object
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        
        // Immediately add the user's message to the UI
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        
        reset(); // Clear the input field
        setIsTyping(true); // Show "AI is thinking"

        try {
            // Sending the request to your backend route
            // We include all necessary context from the 'problem' prop
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages, 
                title: problem.title,
                description: problem.description,
                testCases: JSON.stringify(problem.visibilityTestCases), // Stringify for safe transmission
                startCode: JSON.stringify(problem.startCode)
            });

            // Add the AI's response to the chat history
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            
            // Specifically handle the 429 Rate Limit error
            const errorMsg = error.response?.status === 429 
                ? "AI Limit reached. Please wait a few seconds." 
                : "Failed to get response. Please check your connection.";
                
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: errorMsg }]
            }]);
        } finally {
            setIsTyping(false); // Remove "AI is thinking"
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700">
            {/* Messages Display Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
                        <div className={`chat-bubble ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-200"}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                
                {/* Thinking Indicator */}
                {isTyping && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-neutral-800 text-neutral-400 italic">AI is thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-neutral-800 border-t border-neutral-700">
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Ask about logic, hints, or complexity..." 
                        className={`input input-bordered flex-1 bg-neutral-900 text-white border-neutral-600 focus:border-blue-500 ${errors.message ? 'border-red-500' : ''}`} 
                        {...register("message", { required: true })}
                        disabled={isTyping}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isTyping}>
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;