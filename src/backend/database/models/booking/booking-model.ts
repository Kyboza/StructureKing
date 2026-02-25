import mongoose, {Document, Types} from 'mongoose'

interface IBooking extends Document {
  roomId: Types.ObjectId;     
  userId: Types.ObjectId;       
  startTime: Date;
  endTime: Date;
}
const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema, 'Bookings');

export default Booking