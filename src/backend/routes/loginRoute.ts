import express from 'express'
const router = express.Router();
import { loginUser } from '../controllers/loginController.ts';
router.post("/", loginUser)

export default router;