import express from 'express'
const router = express.Router();
import { verifyAdmin } from '../middleware/auth/verifyAdmin.ts';
import { getRooms, postRooms, putRooms, deleteRooms } from '../controllers/roomController.ts';

router.get("/", getRooms)
router.post("/", verifyAdmin, postRooms)
router.put("/:id", verifyAdmin,putRooms)
router.delete("/:id",verifyAdmin, deleteRooms)

export default router