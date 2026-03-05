import express from 'express'

import { frontendRedirect } from '../controllers/frontendRedirectController.ts'

const router = express.Router()

router.post('/', frontendRedirect)

export default router
