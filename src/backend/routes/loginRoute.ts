import express from 'express'
const router = express.Router();
import { loginUser } from '../controllers/loginController';

router.post("/", loginUser)

export default router;