import express from 'express';
import multer from 'multer';
import { signup, login, isAuth } from './auth.js';
import { getImage, getGames, getInfo } from './getters.js';

const storage = multer.memoryStorage();
const formDataUpload = multer({ storage: storage });

const router = express.Router();

router.post('/getimage', getImage);
router.post('/getgames', getGames);
router.post('/getinfo', getInfo);

router.post('/login', login);

router.post('/signup', formDataUpload.single('profilePicture'), (req, res, next) => {
    // const file = req.file;
    // const name = req.body.name;
    // const email = req.body.email;

    signup(req, res, next);

});

router.get('/private', isAuth);

router.get('/public', (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});

// will match any other path
router.use('/', (req, res, next) => {
    res.status(404).json({error : "page not found"});
});

export default router;