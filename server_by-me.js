const { IncomingMessage } = require("http");
const { isBooleanObject } = require("util/types");

const users = {};
const rooms = {};
const io = require("socket.io")(require("http").createServer(function(){}).listen(80)); //this line is for creating the js server

io.on('connection', io => {
    //Establish Connection
    console.log('Connection established');

//Validate User if exists or Create it if not
    io.on('validate', (inData, inCallback) => {
const user = users[inData.userName];
if(user){  
    if (user.password == inData.password){
        inCallback({status : 'OK'});
        }
    else
        inCallback({status : 'Fail'});
        }
else{
    user[inData.userName] = inData;
    io.brodcast.emit("newUser", users);
    inCallback({status : 'Created'});
    }
});    

//Listing users
io.on("listUsers", (inData, inCallback)=> {
    inCallback(users);
});

//Create rooms
io.on("create", (inData, inCallback) => {
    if(romm[inData.roomName]){
        inCallback({status :'Exists'} );}
    else{
        inData.users = {};
        rooms[inData.roomName] = inData;
        io.brodcast.emit("created", rooms);
        inCallback({status : "created", rooms : rooms});
    } 
    });

 //Listing Rooms  
io.on("listRooms", (inData, inCallback)=> {
    inCallback(rooms);
}); 

//Joining Rooms
io.on("join", (inData, inCallback) => {
   const room = rooms[inData.roomName];
   const user = users[inData.userName];
   if (Object.keys(room.users).length >= rooms.maxPeople){
    inCallback({status : "Full"});
   }
   else{
    room.user = user; //Set the current user as a room user (add it to the room)
    io.brodcast.emit("Joined", room);
    inCallback({status : "Joined", room : room});
   }
});

//Posting messages to rooms
io.on("post", (inData, inCallback) =>{
    io.brodcast.emit("posted", inData);
    inCallback({status : "OK"});
});

//Inviting users to rooms
io.on("invite", (inData, inCallback) => {
    io.brodcast.emit("invited", inData);
    inCallback({status : 'OK'})
});

//Deleting users from rooms
io.on("kick", (inData, inCallback) => {
    const room = rooms[inData.roomName];
    const roomUsers = room.users;

    delete roomUsers[inData.userName];
    io.brodcast.emit("Kicked", room);
    inCallback({status : "OK"});
});

//Leaving Rooms
io.on("leave", (inData, inCallback) => {
    const room = rooms[inData.roomName];
    const roomUsers = room.users;

    delete roomUsers[inData.userName];
    io.brodcast.emit("Left", room);
    inCallback({status : "OK"});
});

//Closing(Deleting) Rooms
io.on("Close", (inData, inCallback) => {
delete rooms[inData.roomName];
io.brodcast.emit("Closed", {roomName : inData.roomName, rooms : rooms});
    inCallback(rooms);
});
});
    