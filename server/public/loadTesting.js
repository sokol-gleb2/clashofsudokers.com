const API = "10.126.137.195";

class Player {

    constructor(apiUrl, username, name, rating, wins, losses, draws, profilePicture = null) {
        this.apiUrl = apiUrl;
        this.username = username;
        this.name = name
        this.rating = rating
        this.wins = wins
        this.losses = losses
        this.draws = draws
        this.profilePicture = profilePicture
        this.responseTimes = [];
        this.nClashes = 0;
        this.gameMoveCounter = 0;
        this.currentOpponent = null;
        this.userExport = {
            username: this.username,
            name: this.name,
            rating: this.rating,
            wins: this.wins,
            losses: this.losses,
            draws: this.draws,
            profilePicture: this.profilePicture
        }
    }

    connect() {
        this.ws = io(this.apiUrl);
        this.ws.on('connect', () => {
            console.log(`Connected: ${this.username}`);
            
            this.requestToJoinQueue();
        });
    
        // Using arrow function here to keep 'this' context
        this.ws.on('message', (message) => {
            const data = JSON.parse(message);
            const to = data.to;
            console.log(data);
            if (to === this.username) {
                this.messageReceived(data);
            }
        });
        
        this.ws.on('connect_error', (error) => {
            console.error(error);
        });
        
        this.ws.on('error', (error) => {
            console.error('Error:', error);
        });
        
        this.ws.on('disconnect', () => {
            console.log('Disconnect from server')
        })
    }
    

    requestToJoinQueue() {
        this.currentOpponent = null;
        this.gameMoveCounter = 0;
        const message = {
            type: "joinQueueReq",
            user: this.userExport
        };
        this.startTime = performance.timeOrigin + performance.now();
        this.sendMessage(message);
    }

    messageReceived(message) {
        if (message.message == "OPPONENT_RETURN") {
            let responseTime = (performance.timeOrigin + performance.now()) - this.startTime;
            this.responseTimes.push(responseTime);

            this.currentOpponent = message.fromUsername;
            
            // reply
            this.startTime = performance.timeOrigin + performance.now();
            this.sendMessage({
                type: "reply",
                to: this.currentOpponent,
                from: this.username
            });
        } else if (message.message == "BEGIN") {
            let responseTime = (performance.timeOrigin + performance.now()) - this.startTime;
            this.responseTimes.push(responseTime);

            const clash_id = message.attachment.clash_id;
            console.log(clash_id);

            // send ~ 38 moves 5 seconds apart
            // if your username goes first in the alphabet, you go first
            const first = this.username < this.currentOpponent ? this.username : this.currentOpponent;
            console.log(first);

            if (first == this.username) {
                console.log("I'm sending: " + this.username);
                this.startTime = performance.timeOrigin + performance.now();
                console.log({ to: this.currentOpponent, clash_id: clash_id, type: "MOVE" });
                this.sendMessage({ to: this.currentOpponent, clash_id: clash_id, type: "MOVE" });
                this.gameMoveCounter++;
            } else {
                console.log("I'm NOT sending: " + this.username);
            }
        } else if (message.message == "SYSTEM_ERROR") {
            // something went wrong, rejoin queue
            this.requestToJoinQueue()
        } else if (message.message == "MOVE") {
            let responseTime = (performance.timeOrigin + performance.now()) - this.startTime - 5000; // cause of 5s delay on each move
            this.responseTimes.push(responseTime);

            if (this.gameMoveCounter < 38) {
                setTimeout(() => {
                    console.log("Sending MOVE back");
                    this.gameMoveCounter++;
                    this.startTime = performance.timeOrigin + performance.now();
                    this.sendMessage({ to: this.currentOpponent, clash_id: clash_id, type: "MOVE" })
                }, 5000);
            } else {
                // match has ended. enter the queue again if haven't filled quota
                if (this.nClashes < 1) {
                    this.requestToJoinQueue()
                } else {
                    // done! display times
                    let p = document.createElement("p")
                    p.classList.add("result")
                    p.innerHTML = `Player: ${this.username}, responseTimes: ${this.responseTimes}`
                    document.getElementById("results").appendChild(p)
                }
            }

        }
    }


    sendMessage(message) {
        this.ws.emit('message', JSON.stringify(message));
    }
}


function generateUniqueId() {
    const timestamp = Date.now().toString(36); // Convert timestamp to base 36 for compactness
    const randomString = Math.random().toString(36).substring(2, 18); // Generate a random string
    
    return (timestamp + randomString).substring(0, 20); // Concatenate and ensure 20 characters
}


// Pre-create player objects
let player1 = new Player(`http://${API}:3001`, generateUniqueId(), 'name1', 800, 1, 1, 1);
player1.connect();

console.log("connecting the second player");
let player2 = new Player(`http://${API}:3001`, generateUniqueId(), 'name2', 800, 1, 1, 1);
player2.connect();



