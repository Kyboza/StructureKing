import express from 'express'
const router = express.Router();
import { logoutUser } from '../controllers/logoutController.ts';

router.delete("/", logoutUser)

export default router