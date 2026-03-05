import express from 'express'

import { refreshAccessToken } from '../controllers/refreshAccessTokenController.ts'

const router = express.Router()

router.post('/', refreshAccessToken)

export default router
