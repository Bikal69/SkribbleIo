export const play=(req,res)=>{
    const {roomId}=req.body.roomId;
    if(roomId){
        res.status(200).json({message:`valid roomId:${roomId}`});
    }else{
        res.status(404).json({message:`invalid roomId:${roomId}`});
    }
}