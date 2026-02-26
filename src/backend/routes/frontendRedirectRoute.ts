import express from 'express'
const router = express.Router();
import { frontendRedirect } from '../controllers/frontendRedirectController.ts';

router.post("/", frontendRedirect)

export default router;