import express from 'express'
const router = express.Router();

import { getRooms, postRooms, putRooms, deleteRooms } from '../controllers/roomController.ts';

router.get("/", getRooms)
router.post("/", postRooms)
router.put("/:id", putRooms)
router.delete("/:id", deleteRooms)

export default router