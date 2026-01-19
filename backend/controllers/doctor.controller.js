import User from "../models/User.js";

// GET ALL DOCTORS
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching doctors" });
  }
};

// UPDATE AVAILABILITY (Doctor only)
export const updateAvailability = async (req, res) => {
  try {
    const { date, slot } = req.body

    if (!date || !slot?.startTime || !slot?.endTime) {
      return res.status(400).json({
        success: false,
        message: "Date and slot timings are required"
      })
    }

    const doctor = await User.findById(req.user.id)

    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update availability"
      })
    }

    // Initialize availability if missing
    if (!doctor.availability) {
      doctor.availability = []
    }

    const dateStr = new Date(date).toISOString().split("T")[0]

    const existingDay = doctor.availability.find(
      a => a.date.toISOString().split("T")[0] === dateStr
    )

    if (existingDay) {
      // 🔴 Prevent overlapping slots
      const overlap = existingDay.slots.some(
        s =>
          !(slot.endTime <= s.startTime || slot.startTime >= s.endTime)
      )

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: "Slot overlaps with existing slot"
        })
      }

      // ✅ APPEND (NOT REPLACE)
      existingDay.slots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false
      })
    } else {
      doctor.availability.push({
        date: new Date(date),
        slots: [
          {
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false
          }
        ]
      })
    }

    await doctor.save()

    res.status(200).json({
      success: true,
      message: "Slot added successfully",
      data: doctor.availability
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// GET DOCTOR AVAILABILITY
export const getAvailability = async (req, res) => {
  try {
    let doctorId

    // Doctor requesting own availability
    if (req.user.role === "doctor") {
      doctorId = req.user.id
    } 
    // Patient requesting a doctor's availability
    else {
      doctorId = req.params.id
    }

    const doctor = await User.findById(doctorId)

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      })
    }

    res.status(200).json(doctor.availability || [])
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}
