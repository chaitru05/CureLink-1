import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["patient", "doctor", "admin"] },

  specialization: String,
  experience: Number,

  availability: [
    {
      date: {
        type: Date,
        required: true
      },
      slots: [
        {
          startTime: String,
          endTime: String,
          isBooked: { type: Boolean, default: false }
        }
      ]
    }
  ]
}, { timestamps: true })

export default mongoose.model("User", UserSchema)