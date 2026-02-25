import express from 'express'
const router = express.Router();
import { registerUser } from '../controllers/registerController';

router.post("/", registerUser)

export default router;