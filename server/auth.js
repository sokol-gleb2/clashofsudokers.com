import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import oracledb from 'oracledb';
import executeQuery from './db.js';
import uploadImage from './AWSupload.js';

const signup = (req, res, next) => {

    const username = req.body.username;
    const email = req.body.email;

    const sql_select = `SELECT email, username FROM SYSTEM.Users WHERE username = :username OR email = :email`;
    const row_select = {username : username, email : email};
    executeQuery("GET", sql_select, row_select)
        .then(rows => {
            if (rows.length != 0) {
                rows.forEach(row => {
                    if (row.EMAIL == email) {
                        res.status(502).json({message: "EMAIL_EXISTS"});
                    } else if (row.USERNAME == username) {
                        res.status(502).json({message: "USERNAME_EXISTS"});
                    }
                })
            } else {
                // all good - can upload
                const password = req.body.password
                const name = req.body.name
                bcrypt.hash(password, 12, (err, passwordHash) => {
                    if (err) {
                        return res.status(500).json({message: "SYSTEM_ERROR"});
                    } else if (passwordHash) {
                        
                        const sql = `INSERT INTO SYSTEM.Users (USERNAME, FULL_NAME, EMAIL, PASSWORD) VALUES (:1, :2, :3, :4)`;
                        const row = [username, name, email, passwordHash];
                        executeQuery("POST", sql, row)
                            .then(response => {
                                console.log(response);
                                if (response == 0) {
                                    // all bad
                                    return res.status(500).json({message: "SYSTEM_ERROR"});
                                } else if (response == 1) {
                                    // all good - upload to AWS
                                    const file = req.file
                                    uploadImage(file, username)
                                        .then(uploadResult => {
                                            if (uploadResult.message === "Upload successful") {
                                                const token = jwt.sign({ username: username }, 'secret', { expiresIn: '24h' });
                                                res.status(200).json({ message: "SIGNED_UP", "token": token });
                                            }
                                        })
                                        .catch(error => {
                                            // handle upload error
                                            console.log(error.message);
                                            res.status(500).send(error.message);
                                        });
                                }
                            })
                            .catch(error => {
                                console.error(error.message);
                                res.status(500).send(error.message);
                            })
                        
                    };
                });
            }
        })
        .catch(err => {
            // Handle errors
            console.error("Error executing query:", err);
        });
    
};

const login = (req, res, next) => {
    const username = req.body.username
    const sql = "SELECT * FROM SYSTEM.Users WHERE username = :username";
    const row_select = {username : username};
    executeQuery("GET", sql, row_select)
        .then(rows => {
            if (rows.length != 0) {
                // Handle the fetched rows
                bcrypt.compare(req.body.password, rows[0].PASSWORD, (err, compareRes) => {
                    if (err) { // error while comparing
                        res.status(502).json({message: "AUTH_ERROR"});
                    } else if (compareRes) { // password match
                        const token = jwt.sign({ username: req.body.username }, 'secret', { expiresIn: '24h' });
                        res.status(200).json({message: "user logged in", "token": token});
                    } else { // password doesnt match
                        res.status(401).json({message: "INVALID_CRED_ERROR"});
                    };
                });
            } else {
                res.status(401).json({message: "INVALID_CRED_ERROR"});
            }
        })
        .catch(err => {
            // Handle errors
            console.error("Error executing query:", err);
        });
};

const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: 'not authenticated' });
    };
    const token = authHeader.split(' ')[1];
    let decodedToken; 
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    };
    if (!decodedToken) {
        res.status(401).json({ message: 'unauthorized' });
    } else {
        res.status(200).json({ message: 'here is your resource' });
    };
};

export { signup, login, isAuth };