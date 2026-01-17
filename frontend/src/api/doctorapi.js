import axiosInstance from "./axiosInstance";

// ==============================
// Doctor APIs
// ==============================

// Get all doctors (Patient / Admin)
export const fetchDoctors = async () => {
  const response = await axiosInstance.get("/doctors");
  return response.data;
};

// Get a doctor's availability (Patient view or Doctor's own view)
export const fetchDoctorAvailability = async (doctorId, date = null) => {
  if (!doctorId) throw new Error("Doctor ID is required");

  const response = await axiosInstance.get(`/doctors/${doctorId}/availability`);
  const availability = response.data || [];

  // If a date is provided, return only that day's slots
  if (date) {
    const dayAvailability = availability.find((a) => a.date === date);
    return dayAvailability ? dayAvailability.slots : [];
  }

  return availability;
};

// Update availability (Doctor)
export const updateDoctorAvailability = async (slots, date = null) => {
  if (!Array.isArray(slots)) {
    throw new Error("Availability must be an array");
  }

  // Backend expects { date, slots } format
  const payload = date ? { date, slots } : { slots };

  const response = await axiosInstance.put("/doctors/availability", payload);
  return response.data;
};
