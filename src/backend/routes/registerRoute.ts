import express from 'express'
const router = express.Router();
import { registerUser } from '../controllers/registerController.ts';

router.post("/", registerUser)

export default router;