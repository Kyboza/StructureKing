import express from 'express'

import { frontendRedirect } from '../controllers/frontendRedirectController.js'

const router = express.Router()

router.post('/', frontendRedirect)

export default router
