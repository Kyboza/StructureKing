import express from 'express'

import { logoutUser } from '../controllers/logoutController'

const router = express.Router()

router.delete('/', logoutUser)

export default router
