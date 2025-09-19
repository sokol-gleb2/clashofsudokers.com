import express from 'express';
// import sequelize from './db.js';
import router from './routes.js';
import { calculateOpponents } from './getters.js';
import { createClient } from 'redis';
import WebSocket, {WebSocketServer} from 'ws';
import {API} from './config.js'
import http from 'http'; // Import the HTTP module to create an HTTP server
import { Server } from 'socket.io';

const app = express();


app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// app.use(express.urlencoded({ extended: true }));

// app.use(express.json());

// app.use((_, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

app.use(express.static('public'));

app.use(router);

// sequelize.sync(); 


export const redisClient = createClient();

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();


export var replies = [];
export var playerQueue = [];

const server = http.createServer(app);
export const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (msg) => {
        let message = JSON.parse(msg)
        // Broadcast the message to all clients except the sender
        socket.broadcast.emit('message', msg);

        console.log("message: ");
        console.log(message);
        if (message.type == "reply") {
            replies.push(message);
        } else if (message.type == "joinQueueReq") {
            if (!playerQueue.some(user => user.username === message.user.username)) {
                playerQueue.push(message.user);
                calculateOpponents(message.user);
            }
        } else if (message.type == "leaveQueueReq") {
            playerQueue.splice(playerQueue.indexOf(message.user), 1);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


// start server
server.listen(3001, () => {
    console.log(`Server listening on port ${3001}.`)
})