import { Types } from "mongoose";
import Room from "../database/models/room/room-model.ts";
import winstonLogger from "../utils/winstonLogger.ts";
import { logError } from "../utils/logError.ts";
import type { Request, Response } from "express";
import { roomsSchema } from "../validation/zod-schemas.ts";

/* =========================
   GET ALL ROOMS
========================= */
export async function getRooms(_req: Request, res: Response): Promise<Response> {
  try {
    const rooms = await Room.find().lean();
    const normalized = rooms.map(r => ({ ...r, _id: r._id.toString() }));
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, error: "Rooms not found" });
    }
    return res.status(200).json({ success: true, rooms: normalized });
  } catch (error) {
    logError(error);
    winstonLogger.error("Server error during room get", { error });
    return res.status(500).json({ success: false, error: "Server Error" });
  }
}

/* =========================
   CREATE ROOM
========================= */
export async function postRooms(req: Request, res: Response): Promise<Response> {
  try {
    const parsed = roomsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid data" });
    }

    const { name, capacity, type, website } = parsed.data;
    if(website) return res.status(400).json({success: false, error: "Could not create room"})

    const roomAlreadyExist = await Room.findOne({ name }).lean();
    if (roomAlreadyExist) {
      return res.status(400).json({ success: false, error: "Room already exists" });
    }

    const newRoomDoc = await Room.create({ name, capacity: Number(capacity), type });
    const newRoom = { ...newRoomDoc.toObject(), _id: newRoomDoc._id.toString() };
    return res.status(201).json({ success: true, room: newRoom, message: "Room created" });
  } catch (error) {
    logError(error);
    winstonLogger.error("Server error during room creation", { error });
    return res.status(500).json({ success: false, error: "Server Error" });
  }
}

/* =========================
   UPDATE ROOM
========================= */
export async function putRooms(req: Request, res: Response): Promise<Response> {
  try {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!roomId || !Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, error: "Invalid room id" });
    }

    const roomObjectId = new Types.ObjectId(roomId);

    const newCapacity = parseInt(req.body.capacity);
    if (isNaN(newCapacity) || newCapacity < 1 || newCapacity > 10) {
      return res.status(400).json({ success: false, error: "Invalid capacity" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomObjectId,
      { capacity: newCapacity },
      { returnDocument: "after", select: "capacity" } // returnerar endast capacity
    ).lean();

    if (!updatedRoom) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    return res.status(200).json({ success: true, roomCapacity: updatedRoom.capacity });
  } catch (error) {
    logError(error);
    winstonLogger.error("Server error during room edit", { error });
    return res.status(500).json({ success: false, error: "Server Error" });
  }
}

/* =========================
   DELETE ROOM
========================= */
export async function deleteRooms(req: Request, res: Response): Promise<Response> {
  try {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!roomId || !Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, error: "Invalid room id" });
    }

    const roomObjectId = new Types.ObjectId(roomId);

    const deletedRoom = await Room.findByIdAndDelete(roomObjectId).lean();
    if (!deletedRoom) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    return res.status(200).json({ success: true, message: "Room deleted"});
  } catch (error) {
    logError(error);
    winstonLogger.error("Server error during room deletion", { error });
    return res.status(500).json({ success: false, error: "Server Error" });
  }
}