import axiosInstance from "./axiosInstance";

// ==============================
// Doctor APIs
// ==============================

// Get all doctors (Patient / Admin)
export const fetchDoctors = async () => {
  const response = await axiosInstance.get("/doctors");
  return response.data;
};

// Get a doctor's availability (Patient)
export const fetchDoctorAvailability = async (doctorId) => {
  if (!doctorId) throw new Error("Doctor ID is required");

  const response = await axiosInstance.get(
    `/doctors/${doctorId}/availability`
  );
  return response.data;
};

// Update availability (Doctor)
export const updateDoctorAvailability = async (availability) => {
  if (!Array.isArray(availability)) {
    throw new Error("Availability must be an array");
  }

  const response = await axiosInstance.put("/doctors/availability", {
    availability,
  });

  return response.data;
};
