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
    const doctor = await User.findById(req.user.id);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Access denied. Only doctors can update availability." });
    }

    // Optional: Validate the availability format
    if (!req.body.availability) {
      return res.status(400).json({ message: "Availability is required" });
    }

    doctor.availability = req.body.availability;
    await doctor.save();

    res.json({ message: "Availability updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating availability" });
  }
};

// GET DOCTOR AVAILABILITY
export const getAvailability = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("availability role");

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ availability: doctor.availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching availability" });
  }
};
