import { useEffect, useState, useRef } from "react";
import style from "../assets/components/chatWidget.module.scss";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import robot from "../assets/img/robot.png";
import user from "../assets/img/user.png";
import { useChatHook } from "../hooks/useChatHook";
import LoadingSpinner from "./LoadingSpinner";

const ChatWidget = ({ setIsOpen }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const bottomRef = useRef();
  const textareaRef = useRef();

  const {
    message,
    setMessage,
    conversations,
    onSubmit,
    initializing,
    isLoading,
  } = useChatHook();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [conversations]);

  return (
    <>
      <div
        className={`${style["chat-window"]} ${isMaximized ? style["chat-window-maximized"] : ""}`}
      >
        <div className={style["chat-header"]}>
          <div className={style["chat-header-title"]}>
            <div className={style["chat-header-status"]} />

            <div className={style["header-title"]}>
              <label>AI Assistant</label>
              <p>Online</p>
            </div>
          </div>

          <div>
            <button
              className={"btn"}
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? "↙" : "↗"}
            </button>

            <button className={"btn"} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
        </div>

        <div className={style["chat-body"]}>
          {!initializing ? (
            <>
              {conversations.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  chatIndex={index}
                  coversation={msg}
                  coversationList={conversations}
                />
              ))}

              {isLoading && (
                <div className={style["loader"]}>
                  <span>
                    <img
                      src={robot}
                      width={22}
                      height={22}
                      style={{ marginRight: "5px", marginTop: "-5px" }}
                    />
                    <i>thinking</i>
                  </span>
                  <div style={{ height: "10px", marginTop: "7px" }}>
                    <LoadingSpinner
                      isLoading={true}
                      showBackDrop={false}
                      centered={false}
                      size={4}
                      color={"gray"}
                    />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          ) : (
            <LoadingSpinner
              isLoading={true}
              showBackDrop={true}
              centered={true}
              size={4}
              color={"gray"}
            />
          )}
        </div>

        <div className={style["chat-input"]}>
          <textarea
            ref={textareaRef}
            value={message}
            placeholder="Type your message..."
            rows={1}
            onChange={(event) => {
              const textarea = event.currentTarget;
              const maxHeight = 80;

              textarea.style.height = "0px";

              const height = Math.min(textarea.scrollHeight, maxHeight);

              textarea.style.height = `${height}px`;
              textarea.style.overflowY =
                textarea.scrollHeight > maxHeight ? "auto" : "hidden";

              setMessage(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                if (message.trim()) {
                  onSubmit();
                }
              }
            }}
          />
          {message ? (
            <button className="btn" onClick={() => onSubmit()}>
              <IoSend className={style["icon-send"]} />
            </button>
          ) : (
            <button className="btn">
              <FaMicrophone />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const ChatMessage = ({ chatIndex, coversation, coversationList }) => {
  const displayUserIcon = () => {
    if (coversation.role === "user") {
      var userId = [];
      var isUser = false;

      coversationList.map((item) => {
        if (item.role === "user" && isUser === false) {
          userId.push(item.id);
          isUser = true;
        }

        if (item.role === "assistant") {
          isUser = false;
        }
      });

      var firstMessage = userId.find((x) => x == coversation.id);

      if (firstMessage) {
        return <img src={user} width={22} height={22} />;
      }
    }
  };

  const getClass = () => {
    if (coversation.role === "user") {
      let prevMessage = coversationList[chatIndex - 1];
      let nextMessage = coversationList[chatIndex + 1];

      if (
        prevMessage &&
        prevMessage.role === "user" &&
        nextMessage &&
        nextMessage.role === "user"
      ) {
        return `${style["user-middle-message"]}`;
      } else {
        if (prevMessage && prevMessage.role === "user") {
          return `${style["user-previous-message"]}`;
        }
        if (nextMessage && nextMessage.role === "user") {
          return `${style["user-next-message"]}`;
        }
      }

      return "";
    }
  };

  if (coversation.content)
    return (
      <div className={`${style["chat-message"]}`}>
        {coversation.role === "assistant" ? (
          <div className={style["bot-message-container"]}>
            <img src={robot} width={22} height={22} />

            <div className={style["bot-message-bubble"]}>
              <label>AI Assistant</label>
              <div className={style["bot-message"]} key={coversation.id}>
                {coversation.content}
              </div>
            </div>
          </div>
        ) : (
          <div className={style["user-message-container"]}>
            <div
              className={`${style["user-message"]} ${getClass()}`}
              key={coversation.id}
            >
              {coversation.content}
            </div>
            <div style={{ width: "30px" }}>{displayUserIcon()}</div>
          </div>
        )}
      </div>
    );
};

export default ChatWidget;
