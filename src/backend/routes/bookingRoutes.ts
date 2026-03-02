import express from 'express'
const router = express.Router();
import { verifyAdmin } from '../middleware/auth/verifyAdmin.ts';
import { getUserBookings, getAllBookings, postBookings, putBookings, deleteBookings } from '../controllers/bookingController.ts';

router.get("/:id", getUserBookings);
router.get("/", verifyAdmin, getAllBookings);
router.post("/", postBookings);
router.put("/:id", putBookings);
router.delete("/:id", deleteBookings);
export default router