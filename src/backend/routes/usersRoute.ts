import express from 'express'

import { deleteUser, getAllUsers } from '../controllers/userController'

const router = express.Router()

router.get('/', getAllUsers)
router.delete('/:id', deleteUser)

export default router
