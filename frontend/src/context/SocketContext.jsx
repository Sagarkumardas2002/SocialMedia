import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useRecoilValue(userAtom);

 useEffect(() => {
  if (user?._id) {
    const socket = io("https://socialmedia-tf66.onrender.com", {
      query: {
        userId: user._id,
      },
    });
    setSocket(socket);

    socket.on("getOnlineUsers", (users) => {
      try {
        const parsedUsers = JSON.parse(users);
        setOnlineUsers(parsedUsers);
      } catch (error) {
        console.error("Failed to parse users JSON:", error);
        // Handle the error appropriately, maybe set an error state
      }
    });

    return () => {
      socket.disconnect();
    };
  }
}, [user?._id]);


  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
