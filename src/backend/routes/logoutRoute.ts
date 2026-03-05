import express from 'express'

import { logoutUser } from '../controllers/logoutController.ts'

const router = express.Router()

router.delete('/', logoutUser)

export default router
