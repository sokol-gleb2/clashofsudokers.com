import jwt from 'jsonwebtoken';
import executeQuery from './db.js';
import updateImage from './AWSupdate.js';
import uploadImage from './AWSupload.js';

const changeDetails = (req, res, next) => {

    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;
    
    const name = req.body.name
    const email = req.body.email

    let blob = null;
    if (req.file) {
        blob = req.file;
    }

    const sql = `UPDATE SYSTEM.Users SET FULL_NAME = :1, EMAIL = :2 WHERE USERNAME = :3`;
    const row = [name, email, username];
    executeQuery("POST", sql, row)
        .then(response => {
            console.log(response);
            if (response == 0) {
                // all bad
                return res.status(500).json({message: "SYSTEM_ERROR"});
            } else if (response == 1 && blob != null) {
                // all good and there is a profile pic to update
                const file = blob
                updateImage(file, username)
                    .then(uploadResult => {
                        if (uploadResult.message === "Upload successful") {
                            res.status(200).json({ url: uploadResult.url });
                        } else {
                            if (uploadResult.cause == "NO_IMAGE_ERROR") { // need to upload it through uploadImage
                                
                                uploadImage(file, username)
                                    .then(uploadResult2 => {
                                        if (uploadResult2.message === "Upload successful") {
                                            res.status(200).json({ url: uploadResult2.url });
                                        }
                                    })
                                    .catch(error => {
                                        // handle upload error
                                        res.status(500).send("INTERNAL_ERROR");
                                    });

                            } else {
                                // something went wrong
                                res.status(500).send("INTERNAL_ERROR");
                            }
                        }
                    })
                    .catch(error => {
                        // handle upload error
                        console.log(error.message);
                        res.status(500).send(error.message);
                    });
            } else if (response == 1) {
                res.status(200).json();
            }
        })
        .catch(error => {
            console.error(error.message);
            res.status(500).send(error.message);
        })
    
};


const deleteAccount = (req, res, next) => {
    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;

    const sql = `DELETE FROM SYSTEM.Users WHERE USERNAME = :1`;
    const row = [username];
    executeQuery("POST", sql, row)
        .then(response => {
            if (response == 0) {
                return res.status(500).json({message: "SYSTEM_ERROR"});
            } else if (response == 1) {
                res.status(200).json({});
            }
        })
        .catch(error => {
            console.error(error.message);
            res.status(500).send(error.message);
        })
}


const saveClashOutcome = (req, res, next) => {
    const token = req.body.token
    const decoded = jwt.verify(token, 'secret');
    const username = decoded.username;

    const duration = req.body.duration;
    const winner_username = req.body.winner
    const sql = "UPDATE SYSTEM.Clashes SET duration = :1, winner_username = :2";
    const row = [duration, winner_username];

    executeQuery("POST", sql, row)
        .then(response => {
            if (response == 0) {
                return res.status(500).json({message: "SYSTEM_ERROR"});
            } else if (response == 1) {

                const clash_id = req.body.clash_id
                const opponent = req.body.opponent
                const user_rating_before = req.body.user_rating_before
                const user_rating_after = req.body.user_rating_after
                const opponent_rating_before = req.body.opponent_rating_before
                const opponent_rating_after = req.body.opponent_rating_after
                
                const sql2 = "INSERT INTO SYSTEM.UserClashes VALUES (:1, :2, :3, :4), (:5, :6, :7, :8)";
                const row2 = [clash_id, username, user_rating_before, user_rating_after, clash_id, opponent, opponent_rating_before, opponent_rating_after];

                executeQuery("POST", sql2, row2)
                    .then(response => {
                        if (response == 0) {
                            return res.status(500).json({message: "SYSTEM_ERROR"});
                        } else if (response == 1) {
                            res.status(200).json({});
                        }
                    })
                    .catch(error => {
                        console.error(error.message);
                        res.status(500).send(error.message);
                    })

            }
        })
        .catch(error => {
            console.error(error.message);
            res.status(500).send(error.message);
        })

}

export { changeDetails, deleteAccount, saveClashOutcome };