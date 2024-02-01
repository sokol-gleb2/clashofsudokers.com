import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import oracledb from 'oracledb';
import executeQuery from './db.js';
import uploadImage from './AWSupload.js';
import retrieveImage from './AWSretrieve.js';

const getGames = (req, res, next) => {

    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;

    const sql = 
    `SELECT opponent.username, opponent.start_rank AS opponent_start_rank, me.start_rank AS me_start_rank, me.end_rank, me.game_id, winner.winner_username
    FROM SYSTEM.UserGames me 
    INNER JOIN (SELECT username, start_rank, game_id FROM SYSTEM.UserGames WHERE username!= :username1) opponent
        ON opponent.game_id = me.game_id
    INNER JOIN (SELECT winner_username, game_id FROM SYSTEM.Games WHERE duration IS NOT NULL) winner 
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
                res.status(200).json({name: row.FULL_NAME, email: row.EMAIL, rank: row.RANK, wins: row.WINS, losses: row.LOSSES, draws: row.DRAWS });
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

export { getImage, getGames, getInfo };