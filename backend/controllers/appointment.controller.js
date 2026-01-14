import mongoose from "mongoose"
import Appointment from "../models/Appointment.js"
import User from "../models/User.js"

export const bookAppointment = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      consultationType,
      reasonForVisit
    } = req.body

    const startTime = timeSlot.split(" - ")[0]
    const dateOnly = new Date(appointmentDate)
    dateOnly.setHours(0, 0, 0, 0)

    // 🔐 Lock slot using DATE + TIME
    const updatedDoctor = await User.findOneAndUpdate(
      {
        _id: doctorId,
        "availability.date": dateOnly,
        "availability.slots": {
          $elemMatch: {
            startTime,
            isBooked: false
          }
        }
      },
      {
        $set: {
          "availability.$[day].slots.$[slot].isBooked": true
        }
      },
      {
        arrayFilters: [
          { "day.date": dateOnly },
          { "slot.startTime": startTime }
        ],
        new: true,
        session
      }
    )

    if (!updatedDoctor) {
      throw new Error("Time slot already booked or unavailable")
    }

    const appointment = await Appointment.create(
      [{
        patientId: req.user.id,
        doctorId,
        appointmentDate: dateOnly,
        timeSlot,
        consultationType,
        reasonForVisit,
        status: "confirmed"
      }],
      { session }
    )

    await session.commitTransaction()
    res.status(201).json(appointment[0])

  } catch (error) {
    await session.abortTransaction()
    res.status(409).json({ message: error.message })
  } finally {
    session.endSession()
  }
}


// GET PATIENT APPOINTMENTS
export const getPatientAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    patientId: req.user.id
  }).populate("doctorId", "name specialization")

  res.json(appointments)
}

// GET DOCTOR APPOINTMENTS
export const getDoctorAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    doctorId: req.user.id
  }).populate("patientId", "name age")

  res.json(appointments)
}

// UPDATE APPOINTMENT STATUS
export const updateAppointmentStatus = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  )

  res.json(appointment)
}

export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)

  const startTime = appointment.timeSlot.split(" - ")[0]
  const dateOnly = new Date(appointment.appointmentDate)
  dateOnly.setHours(0, 0, 0, 0)

  await User.updateOne(
    { _id: appointment.doctorId },
    {
      $set: {
        "availability.$[day].slots.$[slot].isBooked": false
      }
    },
    {
      arrayFilters: [
        { "day.date": dateOnly },
        { "slot.startTime": startTime }
      ]
    }
  )

  appointment.status = "cancelled"
  await appointment.save()

  res.json({ message: "Appointment cancelled and slot released" })
}

