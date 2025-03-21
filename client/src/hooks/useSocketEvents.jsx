import { useEffect } from "react";

export const useSocketEvents=(socket,socketReady,handlers)=>{
useEffect(()=>{
console.log('usesocketevent ran');
Object.entries(handlers).forEach(([event,handler])=>{
    socket.on(event,handler);
});
return ()=>{
    Object.entries(handlers).forEach(([event,handler])=>{
        socket.off(event);
    });
}
},[socket,socketReady])
}