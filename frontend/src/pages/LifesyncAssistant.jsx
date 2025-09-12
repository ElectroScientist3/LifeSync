import { useState, useRef, useEffect } from "react";

function LifesyncAssistant() {
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hello! I'm Lifesync Assistant 🤖. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    // Placeholder for AI response
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { sender: "assistant", text: "I'm just a demo for now. Soon I'll help you manage your routines, meals, and more!" }
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] md:max-h-[70vh] bg-white rounded-lg shadow mx-auto my-8 max-w-2xl">
      <div className="flex items-center gap-2 px-6 py-4 border-b bg-yellow-50 rounded-t-lg">
        <span className="text-2xl">🤖</span>
        <span className="font-bold text-xl text-yellow-700">Lifesync Assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-yellow-200 text-yellow-900"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t bg-white rounded-b-lg">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default LifesyncAssistant;