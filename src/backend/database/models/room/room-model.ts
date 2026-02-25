import mongoose, {Document} from 'mongoose'

interface IRoom extends Document {
    name: string;
    capacity: number;
    type: 'Workspace' | 'Conference';
}

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['Workspace', 'Conference'], required: true },
});

const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema, 'Rooms');

export default Room