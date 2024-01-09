// require('dotenv').config() // npm install dotenv
// var bodyParser = require('body-parser')

import express from 'express';
// const mime = require('mime')
// const socketIO = require('socket.io')
// const http = require('http')
import sequelize from './db.js';
import router from './routes.js';


// let server = http.createServer(app)
// let io = socketIO(server)


const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(router);

sequelize.sync(); 

// start server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}.`)
})

// app.use( bodyParser.json() );       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }))


// io.on('connection', (socket) => {
//     console.log('New user connected')

//     socket.emit('newMessage', {
//         from:'jen@mds',
//         text:'hepppp',
//         createdAt:123
//     })

//     socket.on('createMessage', (newMessage)=>{
//         console.log('newMessage', newMessage);
//     })

//     socket.on('disconnect', ()=>{
//         console.log('disconnected from user');
//     })
// })

// app.use(express.static(__dirname + '/public', {
//     setHeaders: function(res, path) {
//       if (mime.getType(path) === 'application/javascript') { // send javascript file with type javascript
//         res.setHeader('Content-Type', 'application/javascript');
//       }
//     }
// }))


// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/public/index.html")
// })

// app.get("/login", (req, res) => {
//     res.sendFile(__dirname + "/public/login.html")
// })

// app.post("/login_auth", (req, res) => {
//     res.send("Email: " + req.body.email + " Password: " + req.body.password)
// })