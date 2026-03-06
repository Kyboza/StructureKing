import express from 'express'

import { logoutUser } from '../controllers/logoutController.js'

const router = express.Router()

router.delete('/', logoutUser)

export default router
