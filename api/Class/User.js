class Player {
    constructor(id,socket,username){
        this.id=id;
        this.socket=socket;
        this.socketId=socket.id;
        this.username=username;
        this.score=0;
    }
    getUserInfo(){
        return {
            id:this.id,
            socketId:this.socketId,
            username:this.username,
            score:this.score
        }
    }
};
export default Player;