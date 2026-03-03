import express from 'express'
const router = express.Router();
import { getAllUsers, deleteUser } from '../controllers/userController.ts';

router.get("/", getAllUsers);
router.delete("/:id", deleteUser);

export default router;