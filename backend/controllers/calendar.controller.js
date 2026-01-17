import Appointment from "../models/Appointment.js";
import MedicineReminder from "../models/MedicineReminder.js";
import User from "../models/User.js";

// ---------------------------
// PATIENT CALENDAR
// ---------------------------
export const patientCalendar = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch upcoming appointments
    const appointments = await Appointment.find({
      patientId: req.user.id,
      appointmentDate: { $gte: today }
    })
      .populate("doctorId", "name specialization")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    // Fetch upcoming medicine reminders
    const reminders = await MedicineReminder.find({
      patientId: req.user.id,
      reminderDate: { $gte: today }
    }).sort({ reminderTime: 1 });

    res.json({ appointments, reminders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching patient calendar" });
  }
};

// ---------------------------
// DOCTOR CALENDAR
// ---------------------------
export const doctorCalendar = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      appointmentDate: { $gte: today }
    })
      .populate("patientId", "name age")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctor calendar" });
  }
};
