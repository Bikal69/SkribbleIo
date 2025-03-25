import { createContext, useContext, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { storage } from "../utils/utils.js";

// Create a socket instance outside of the React component lifecycle

const SocketContext = createContext();

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useMemo(()=>io('https://skribblow.onrender.com',{
    query:{
      //here i am sending playerId in the form of object because if i just simply send playerId
      //..then even if null value is sent then it will be encoded as string in http but not object because of json
        playerId:storage.get('playerId')
    }
  }),[]);
  console.log('socket value:',socket)
  const [socketReady, setSocketReady] = useState(socket.connected);
  
  useEffect(() => {
    // Define event handlers
    console.log('socket provider effect')
    console.log('useeffect run')
    const onConnect = () => {
      setSocketReady(true);
      console.log('connected to server');
    };
    
    const onDisconnect = () => {
      setSocketReady(false);
      console.log('disconnected from server');
    };
    
    const onConnectError = (error) => {
      setSocketReady(false);
      console.error('Connection failed', error);
    };

    // Set up event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    
    socket.on('reconnect',function(){
      console.log('reconnected')
    });
    socket.on('reconnecting',function(){
      console.log('reconnecting')
    })
    
    
    // Cleanup event listeners when the component unmounts
    return () => {
      console.log('unmounting')
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      if(socket.connected){
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketReady }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
