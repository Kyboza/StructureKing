import express from 'express'

import { loginUser } from '../controllers/loginController.ts'

const router = express.Router()

router.post('/', loginUser)

export default router
