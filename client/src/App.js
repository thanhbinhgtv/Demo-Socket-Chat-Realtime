import './App.css';
import { useState, useEffect, useRef } from 'react'
import socketIOClient from "socket.io-client";

const host = "http://localhost:3000";

function App() {
  const [mess, setMess] = useState([]);
  const [message, setMessage] = useState('');
  const [id, setId] = useState();

  const socketRef = useRef();
  const messagesEnd = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient.connect(host);

    socketRef.current.on('getId', data => {               // phần này đơn giản để gán id cho mỗi phiên kết nối vào page. Mục đích chính là để phân biệt đoạn nào là của mình đang chat.
      setId(data);
    });

    socketRef.current.on('sendDataServer', dataGot => {
      setMess(oldMsgs => [...oldMsgs, dataGot.data]);     // mỗi khi có tin nhắn thì mess sẽ được render thêm 
      scrollToBottom();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message !== null) {
      const msg = {
        content: message,
        id: id
      }
      socketRef.current.emit('sendDataClient', msg);

      /* Khi emit('sendDataClient') bên phía server sẽ nhận được sự kiện có tên 'sendDataClient' và handle như câu lệnh trong file index.js
         socket.on("sendDataClient", function(data) { // Handle khi có sự kiện tên là sendDataClient từ phía client
         socketIo.emit("sendDataServer", { data });// phát sự kiện có tên sendDataServer cùng với dữ liệu tin nhắn từ phía server
      */
      setMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEnd.current.scrollIntoView({ behavior: "smooth" });
  };

  const renderMess = mess.map((m, index) => {
    return (
      <div
        key={index}
        className={`${m.id === id ? 'your-message' : 'other-people'} chat-item`}
      >
        {m.content}
      </div>
    )
  });

  const onEnterPress = (e) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      sendMessage();
    }
  };

  return (
    <div className="box-chat">
      <div className="box-chat_message">
        {renderMess}
        <div style={{ float: "left", clear: "both" }} ref={messagesEnd}></div>
      </div>

      <div className="send-box">
        <textarea
          value={message}
          onKeyDown={onEnterPress}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message ..."
        />
        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
