import express from 'express';
import multer from 'multer';
import { signup, login, isAuth } from './auth.js';
import { getImage, getGames, getInfo, getPuzzle } from './getters.js';
import { changeDetails, deleteAccount, saveClashOutcome } from './updaters.js';
import path from 'path'; // Import the path module
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const formDataUpload = multer({ storage: storage });

const router = express.Router();

router.post('/getimage', getImage);
router.post('/getgames', getGames);
router.post('/getinfo', getInfo);
router.post('/getpuzzle', getPuzzle);
router.post('/deleteaccount', deleteAccount);
router.post('/saveclashoutcome', saveClashOutcome);
router.post('/changedetails', formDataUpload.single('profilePicture'), (req, res, next) => { changeDetails(req, res, next); });

router.post('/login', login);

router.post('/signup', formDataUpload.single('profilePicture'), (req, res, next) => {
    signup(req, res, next);
});


router.get('/private', isAuth);

router.get('/public', (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});

// will match any other path
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

export default router;