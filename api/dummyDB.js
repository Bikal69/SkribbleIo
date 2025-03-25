export const rooms=[];

export const removeRoom=(id)=>{
    const indexOfRoom=rooms.findIndex((room)=>room.id===id);
    if(rooms.splice(indexOfRoom,1)){
        return true;
    }
    return false;
};
export  const findRoom=(id)=>{
    const indexOfRoom=rooms.findIndex((room)=>room.id===id);
    return indexOfRoom;
}
