import react, { useEffect, useState } from "react";
import {
  useStartConversationMutation,
  useSendMessageMutation,
} from "../hooks/api/chatApi";
import { useSelector } from "react-redux";

export const useChatHook = () => {
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");
  const [startConversation, { isLoading: initializing }] =
    useStartConversationMutation();
  //onst [sendMessage, { isLoading }] = useSendMessageMutation();
  const [isLoading, setIsloading] = useState(false);

  const user = useSelector((state) => state.auth);

  useEffect(() => {
    setTimeout(() => {
      var conversation_id = localStorage.getItem("conversation_id");

      if (conversation_id && conversations.length == 0) {
        var _user = user?.isAuthenticated ? user.firstname : "";

        var initialChat = {
          id: crypto.randomUUID(),
          conversation_id: conversation_id,
          content: `Hi ${_user}! 👋 I’m your AI customer service assistant. I can help with questions about our products, services, and policies. What can I help you with today?`,
          role: "assistant",
          timestamp: "2023-08-01 10:00:00",
        };
        setConversations((msg) => [...msg, initialChat]);
      }
    }, 200);
  }, []);

  const onCreateConversation = async () => {
    console.log("initializing conversation...");
    var conversation = await startConversation().unwrap();

    if (!initializing) {
      localStorage.setItem("conversation_id", conversation.id);
      console.log("initialized");
    }
  };

  const onSubmit = async () => {
    setIsloading(true);

    const userText = message.trim();

    setMessage("");
    var conversation_id = localStorage.getItem("conversation_id");

    if (!userText) {
      return;
    }

    var userChat = {
      id: crypto.randomUUID(),
      conversation_id: conversation_id,
      content: message,
      role: "user",
      timestamp: "2023-08-01 10:00:00",
    };
    setConversations((msg) => [...msg, userChat]);

    const token = localStorage.getItem("access_token");
    console.log(token);
    const response = await fetch(`/api/chat/send_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        conversation_id: conversation_id,
        message: userText,
      }),
    });

    console.log("response received");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let assistantResponse = "";
    let assistantId = null;

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      // Keep incomplete event for the next chunk
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.startsWith("data: ")) {
          continue;
        }

        const data = JSON.parse(event.slice(6));
        console.log(data);

        if (data.type === "start") {
          assistantId = data.id;
          setConversations((prev) => [
            ...prev,
            {
              id: data.id,
              conversation_id: data.conversation_id,
              role: "assistant",
              content: "",
              created_date: data.created_date,
            },
          ]);
        }

        if (data.type === "content") {
          setIsloading(false);
          assistantResponse += data.content;

          setConversations((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: assistantResponse,
                  }
                : msg,
            ),
          );
        }

        if (data.type === "complete") {
          console.log("AI MESSAGE COMPLETE:", data);
        }
      }
    }
  };

  return {
    message,
    setMessage,
    conversations,
    setConversations,
    onSubmit,
    onCreateConversation,
    initializing,
    isLoading,
  };
};
