import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

interface WebSocketProps {
  stompClient: Client | null;
}

const WebSocket: React.FC<WebSocketProps> = ({ stompClient }) => {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      // Subscribe tới topic để nhận message
      const subscription = stompClient.subscribe("/topic/messages", (msg) => {
        setReceivedMessages((prev) => [...prev, msg.body]);
      });

      // Cleanup subscription khi component unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stompClient]);

  const sendMessage = () => {
    if (stompClient && stompClient.connected && message.trim()) {
      // Gửi message tới server
      stompClient.publish({
        destination: "/app/sendMessage",
        body: message,
      });
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h2>WebSocket Chat</h2>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          style={{ width: "300px", padding: "5px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!stompClient?.connected}
          style={{ marginLeft: "10px", padding: "5px 10px" }}
        >
          Send
        </button>
      </div>
      <h3>Messages:</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {receivedMessages.map((msg, index) => (
          <li key={index} style={{ margin: "5px 0" }}>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocket;