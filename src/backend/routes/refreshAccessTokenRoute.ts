import express from 'express'

import { refreshAccessToken } from '../controllers/refreshAccessTokenController'

const router = express.Router()

router.post('/', refreshAccessToken)

export default router
