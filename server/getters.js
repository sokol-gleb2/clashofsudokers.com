import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import oracledb from 'oracledb';
import executeQuery from './db.js';
import uploadImage from './AWSupload.js';
import retrieveImage from './AWSretrieve.js';
import { getSudoku } from 'sudoku-gen';
import { io, replies, playerQueue, redisClient } from './server.js'

class User {
    constructor(username, name, rating, wins, losses, draws) {
        this.username = username;
        this.name = name;
        this.rating = rating;
        this.wins = wins;
        this.losses = losses;
        this.draws = draws;
    }
}

const getGames = (req, res, next) => {

    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;

    const sql = 
    `SELECT opponent.username, opponent.start_rank AS opponent_start_rank, me.start_rank AS me_start_rank, me.end_rank, me.game_id, winner.winner_username
    FROM SYSTEM.UserClashes me 
    INNER JOIN (SELECT username, start_rank, game_id FROM SYSTEM.UserClashes WHERE username!= :username1) opponent
        ON opponent.game_id = me.game_id
    INNER JOIN (SELECT winner_username, game_id FROM SYSTEM.Clashes WHERE duration IS NOT NULL) winner 
        ON winner.game_id = me.game_id
    WHERE me.username = :username2`;
    const row_select = {username1 : username, username2: username};

    executeQuery("GET", sql, row_select)
        .then(rows => {
            let games = [];
            rows.forEach(row => {
                let rank_diff = row.END_RANK - row.ME_START_RANK;
                let opponent = {
                    rank: row.OPPONENT_START_RANK,
                    username: row.USERNAME,
                }
                let result = "W";
                if (row.WINNER_USERNAME != username) {
                    if (row.WINNER_USERNAME == null) {
                        result = "D";
                    } else {
                        result = "L";
                    }
                }
                games.push({
                    game_id: row.GAME_ID,
                    opponent: opponent,
                    rank_diff: rank_diff,
                    result: result
                });
            })
            res.status(200).json(games);
        })
        .catch(err => {
            // Handle errors
            console.error("Error executing query:", err);
            res.status(500).json({message: "INTERNAL_ERROR"});
        });
    
};

const getImage = (req, res, next) => {
    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;

    retrieveImage(username)
    .then(urlJson => {
        const url = urlJson.url;
        if (url) {
            res.status(200).json({ url: url });
        } else {
            console.log(urlJson);
            res.status(400).json({ message: "IMAGE_ERROR" });
        }
    })
    .catch(error => {
        // handle upload error
        console.error("Error getting image:", error);
        res.status(500).send(error.message);
    });
};

const getInfo = (req, res, next) => {
    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;

    const sql = `SELECT full_name, email, rank, wins, losses, draws FROM SYSTEM.Users WHERE username = :username`;
    const row_select = {username : username};

    executeQuery("GET", sql, row_select)
        .then(rows => {
            if (rows.length == 1) {
                const row = rows[0];
                res.status(200).json({username: username, name: row.FULL_NAME, email: row.EMAIL, rank: row.RANK, wins: row.WINS, losses: row.LOSSES, draws: row.DRAWS });
            } else {
                res.status(401).json({message: "INVALID_CRED_ERROR"});
            }
        })
        .catch(err => {
            // Handle errors
            console.error("Error executing query 2:", err);
            res.status(500).json({message: "INTERNAL_ERROR"});
        });
    
};


const getPuzzle = (req, res, next) => {
    // Get a sudoku of specific difficulty (easy, medium, hard, expert)
    // const sudoku = getSudoku('easy');

    try {
        // Get a sudoku of random difficulty
        const sudoku = getSudoku();
        return sudoku;
    } catch (error) {
        return {message: "INTERNAL_ERROR"};
    }
}






// Function to find an opponent
async function findOpponent(currentUser) {
    let loop = 1;
    let opponent;

    while (loop < 4) {
        // Wrap the timeout in a promise to await it
        if (playerQueue.includes(currentUser)) {

            opponent = playerQueue.find(user => 
                Math.abs(user.rating - currentUser.rating) <= 100 * loop && user.username !== currentUser.username);
                
            if (opponent) {
                break; // Exit the loop if an opponent is found
            } else {
                await new Promise(resolve => setTimeout(resolve, 45000));
                loop++;
            }
        } else {
            // match for the user has already been foudn and they have been removed from queue
            return "THREAD_SAFETY_MEASURE";
        }
    }

    return opponent;
}

const sendMessageToClients = (msg_json) => {
    io.emit('message', JSON.stringify(msg_json));
    // wss.clients.forEach(client => {
    //     if (client.readyState === WebSocket.OPEN) {
    //         client.send(JSON.stringify(msg_json));
    //     }
    // });
};

const checkReplies = async (opponent, user) => {
    let opponentReady = false;
    let userReady = false;

    for (let loop = 0; loop < 6; loop++) {

        for (let i = 0; i < replies.length; i++) {
            if (replies[i].from === opponent.username) {
                opponentReady = true;
            } else if (replies[i].from === user.username) {
                userReady = true;
            }
            
            if (opponentReady && userReady) {
                break;
            }
        }
        
        if (opponentReady && userReady) {
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return (opponentReady && userReady);
};


// Simulate sending a notification
async function sendNotification(opponent, user, message, attachment) {
    const msg_json_opponent = {
        to: opponent.username,
        fromUsername: user.username,
        fromName: user.name,
        fromRating: user.rating,
        fromWins: user.wins,
        fromLosses: user.losses,
        fromDraws: user.draws,
        fromProfilePicture: user.profilePicture,
        message: message,
        attachment: attachment
    };

    const msg_json_user = {
        to: user.username,
        fromUsername: opponent.username,
        fromName: opponent.name,
        fromRating: opponent.rating,
        fromWins: opponent.wins,
        fromLosses: opponent.losses,
        fromDraws: opponent.draws,
        fromProfilePicture: opponent.profilePicture,
        message: message,
        attachment: attachment
    }

    // Send the notification to all clients
    sendMessageToClients(msg_json_opponent);
    sendMessageToClients(msg_json_user);

    if (message === "OPPONENT_RETURN") {
        const usersReady = await checkReplies(opponent, user);
        return usersReady;
    }

    return null;
}


function generateUniqueId() {
    const timestamp = Date.now().toString(36); // Convert to base 36 to make it shorter
    const randomStr = Math.random().toString(36).substr(2, 5); // Generate random string and take a part of it
    const uniqueId = (timestamp + randomStr).padStart(13, '0'); // Pad with leading zeros to make it 13 characters long
    return uniqueId;
}

// Insert a game into the "Clashes" table (simulated here)
function insertClash(user, opponent) {
    return new Promise((resolve, reject) => {
        const clash_id = user.username + opponent.username + generateUniqueId()
        const sql = `INSERT INTO SYSTEM.Clashes (GAME_ID) VALUES (:1)`;
        const row = [clash_id];
        executeQuery("POST", sql, row)
            .then(response => {
                if (response == 0) {
                    // all bad
                    resolve({ message: "SYSTEM_ERROR" });
                } else if (response == 1) {
                    // all good
                    resolve({ message: "BEGIN_CLASH", clash_id: clash_id });
                }
            })
            .catch(error => {
                console.error(error.message);
                reject({ message: "SYSTEM_ERROR" });
            });
    });
}


async function calculateOpponents(user) {
    console.log(user);
    playerQueue.forEach(p => {
        console.log(p.username + " : " + p.rating);
    })
    const opponent = await findOpponent(user);
    if (opponent) {
        if (opponent != "THREAD_SAFETY_MEASURE") {
            // Remove users from queue only when opponent is confirmed
            playerQueue.splice(playerQueue.indexOf(opponent), 1);
            playerQueue.splice(playerQueue.indexOf(user), 1);
    
            const everyoneReady = await sendNotification(opponent, user, "OPPONENT_RETURN");
    
            if (everyoneReady) {
                const insertResult = await insertClash(user, opponent);
                if (insertResult.message === "BEGIN_CLASH") {
                    const puzzle = getPuzzle();
    
                    await sendNotification(opponent, user, "BEGIN", {puzzle: puzzle, clash_id: insertResult.clash_id});
    
                } else {
                    await sendNotification(opponent, user, "ERROR_RETRY_TIMEOUT");
                }
            } else {
                await sendNotification(opponent, user, "CANCEL");
                await sendNotification(user, opponent, "CANCEL");
            }
        }
    } else {
        // If no opponent found, handle the logic to notify the user or retry
        console.log("No opponent found for " + user.username);
        await sendNotification({}, user, "CANCEL");
        // Implement logic to notify the user or retry finding an opponent
    }
}

export { getImage, getGames, getInfo, getPuzzle, calculateOpponents };