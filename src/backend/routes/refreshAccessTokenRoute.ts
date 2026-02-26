import express from 'express'
const router = express.Router();
import { refreshAccessToken } from '../controllers/refreshAccessTokenController.ts';

router.post("/", refreshAccessToken)

export default router;