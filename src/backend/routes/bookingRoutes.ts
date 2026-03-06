import express from 'express'

import {
    deleteBookings,
    getAllBookings,
    getUserBookings,
    postBookings,
    putBookings,
} from '../controllers/bookingController'

const router = express.Router()

router.get('/:id', getUserBookings)
router.get('/', getAllBookings)
router.post('/', postBookings)
router.put('/:id', putBookings)
router.delete('/:id', deleteBookings)
export default router
