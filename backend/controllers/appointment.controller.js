import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// ---------------------------
// BOOK APPOINTMENT (Atomic)
// ---------------------------
export const bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { doctorId, appointmentDate, timeSlot, consultationType, reasonForVisit } = req.body;
    const startTime = timeSlot.split(" - ")[0].trim();

    // UTC-safe date
    const appointmentDay = new Date(appointmentDate);
    appointmentDay.setUTCHours(0, 0, 0, 0);

    // Atomic slot booking
    const updatedDoctor = await User.findOneAndUpdate(
      {
        _id: doctorId,
        availability: {
          $elemMatch: {
            date: appointmentDay,
            slots: { $elemMatch: { startTime, isBooked: false } }
          }
        }
      },
      {
        $set: { "availability.$[day].slots.$[slot].isBooked": true }
      },
      {
        arrayFilters: [
          { "day.date": appointmentDay },
          { "slot.startTime": startTime }
        ],
        new: true,
        session
      }
    );

    if (!updatedDoctor) {
      throw new Error("Time slot already booked or unavailable. Please choose another slot.");
    }

    const appointment = await Appointment.create(
      [
        {
          patientId: req.user.id,
          doctorId,
          appointmentDate: appointmentDay,
          timeSlot,
          consultationType,
          reasonForVisit,
          status: "confirmed"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: "Appointment booked successfully", appointment: appointment[0] });

  } catch (error) {
    await session.abortTransaction();
    res.status(409).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// ---------------------------
// CANCEL APPOINTMENT
// ---------------------------
export const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(req.params.id).session(session);
    if (!appointment) throw new Error("Appointment not found");

    const startTime = appointment.timeSlot.split(" - ")[0].trim();
    const appointmentDay = new Date(appointment.appointmentDate);
    appointmentDay.setUTCHours(0, 0, 0, 0);

    // Release slot atomically
    const updatedDoctor = await User.updateOne(
      { _id: appointment.doctorId },
      { $set: { "availability.$[day].slots.$[slot].isBooked": false } },
      {
        arrayFilters: [
          { "day.date": appointmentDay },
          { "slot.startTime": startTime }
        ],
        session
      }
    );

    if (updatedDoctor.modifiedCount === 0) {
      throw new Error("Slot release failed. Please check doctor availability.");
    }

    appointment.status = "cancelled";
    await appointment.save({ session });

    await session.commitTransaction();
    res.json({ message: "Appointment cancelled and slot released", appointment });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// ---------------------------
// GET PATIENT APPOINTMENTS
// ---------------------------
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient appointments" });
  }
};

// ---------------------------
// GET DOCTOR APPOINTMENTS
// ---------------------------
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .populate("patientId", "name age")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor appointments" });
  }
};

// ---------------------------
// UPDATE APPOINTMENT STATUS
// ---------------------------
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment status" });
  }
};
