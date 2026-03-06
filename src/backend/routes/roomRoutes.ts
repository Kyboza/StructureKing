import express from 'express'

import {
    deleteRooms,
    getRooms,
    postRooms,
    putRooms,
} from '../controllers/roomController'
import { verifyAdmin } from '../middleware/auth/verifyAdmin'

const router = express.Router()

router.get('/', getRooms)
router.post('/', verifyAdmin, postRooms)
router.put('/:id', verifyAdmin, putRooms)
router.delete('/:id', verifyAdmin, deleteRooms)

export default router
