import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ========== MODELS ==========
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["patient", "doctor", "admin"] },
  specialization: String,
  experience: Number,
  availability: [{
    date: { type: Date, required: true },
    slots: [{ startTime: String, endTime: String, isBooked: { type: Boolean, default: false } }]
  }]
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointmentDate: Date,
  timeSlot: String,
  consultationType: String,
  reasonForVisit: String,
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "confirmed" }
}, { timestamps: true });

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  diagnosis: String,
  symptoms: String,
  prescriptions: [{ medicineName: String, dosage: String, times: [{ time: String }], durationInDays: Number, startDate: Date }]
}, { timestamps: true });

const MedicineReminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicineName: String,
  dosage: String,
  reminderDate: Date,
  reminderTime: String,
  isTaken: { type: Boolean, default: false }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  type: { type: String, enum: ["appointment", "reminder", "system"] },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const PatientHistorySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  allergies: [String],
  pastIllnesses: [String],
  ongoingMedications: [String],
  surgeries: [String]
}, { timestamps: true });

const PlatformActivitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: "targetType" },
  targetType: { type: String, enum: ["User", "Appointment", "MedicalRecord", "System"], default: "System" },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
const Appointment = mongoose.model("Appointment", AppointmentSchema);
const MedicalRecord = mongoose.model("MedicalRecord", MedicalRecordSchema);
const MedicineReminder = mongoose.model("MedicineReminder", MedicineReminderSchema);
const Notification = mongoose.model("Notification", NotificationSchema);
const PatientHistory = mongoose.model("PatientHistory", PatientHistorySchema);
const PlatformActivity = mongoose.model("PlatformActivity", PlatformActivitySchema);

// ========== SEED DATA ==========
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Appointment.deleteMany({}),
    MedicalRecord.deleteMany({}),
    MedicineReminder.deleteMany({}),
    Notification.deleteMany({}),
    PatientHistory.deleteMany({}),
    PlatformActivity.deleteMany({})
  ]);
  console.log("🗑️  Cleared all collections");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==================== ADMIN ====================
  const admin = await User.create({
    name: "Dr. Rajesh Kumar",
    email: "admin@curelink.com",
    password: hashedPassword,
    role: "admin"
  });
  console.log("👑 Admin created");

  // ==================== DOCTORS ====================
  const doctorsData = [
    { name: "Dr. Priya Sharma", email: "priya.sharma@curelink.com", specialization: "Cardiologist", experience: 12 },
    { name: "Dr. Amit Patel", email: "amit.patel@curelink.com", specialization: "Dermatologist", experience: 8 },
    { name: "Dr. Neha Gupta", email: "neha.gupta@curelink.com", specialization: "Pediatrician", experience: 15 },
    { name: "Dr. Vikram Singh", email: "vikram.singh@curelink.com", specialization: "Orthopedic Surgeon", experience: 20 },
    { name: "Dr. Anjali Desai", email: "anjali.desai@curelink.com", specialization: "Neurologist", experience: 10 },
    { name: "Dr. Rahul Mehta", email: "rahul.mehta@curelink.com", specialization: "General Physician", experience: 6 },
  ];

  // Generate availability for next 14 days
  function generateAvailability() {
    const availability = [];
    const timeSlots = [
      { startTime: "09:00 AM", endTime: "09:30 AM" },
      { startTime: "09:30 AM", endTime: "10:00 AM" },
      { startTime: "10:00 AM", endTime: "10:30 AM" },
      { startTime: "10:30 AM", endTime: "11:00 AM" },
      { startTime: "11:00 AM", endTime: "11:30 AM" },
      { startTime: "11:30 AM", endTime: "12:00 PM" },
      { startTime: "02:00 PM", endTime: "02:30 PM" },
      { startTime: "02:30 PM", endTime: "03:00 PM" },
      { startTime: "03:00 PM", endTime: "03:30 PM" },
      { startTime: "03:30 PM", endTime: "04:00 PM" },
    ];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      availability.push({
        date,
        slots: timeSlots.map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
          isBooked: false
        }))
      });
    }
    return availability;
  }

  const doctors = [];
  for (const d of doctorsData) {
    const doc = await User.create({
      name: d.name,
      email: d.email,
      password: hashedPassword,
      role: "doctor",
      specialization: d.specialization,
      experience: d.experience,
      availability: generateAvailability()
    });
    doctors.push(doc);
  }
  console.log(`🩺 ${doctors.length} Doctors created`);

  // ==================== PATIENTS ====================
  const patientsData = [
    { name: "Aarav Joshi", email: "aarav@gmail.com" },
    { name: "Sneha Reddy", email: "sneha@gmail.com" },
    { name: "Rohan Nair", email: "rohan@gmail.com" },
    { name: "Meera Kulkarni", email: "meera@gmail.com" },
    { name: "Karan Malhotra", email: "karan@gmail.com" },
    { name: "Ananya Iyer", email: "ananya@gmail.com" },
    { name: "Ishaan Verma", email: "ishaan@gmail.com" },
    { name: "Pooja Bhatt", email: "pooja@gmail.com" },
    { name: "Arjun Chauhan", email: "arjun@gmail.com" },
    { name: "Divya Saxena", email: "divya@gmail.com" },
  ];

  const patients = [];
  for (const p of patientsData) {
    const patient = await User.create({
      name: p.name,
      email: p.email,
      password: hashedPassword,
      role: "patient"
    });
    patients.push(patient);
  }
  console.log(`🧑‍🤝‍🧑 ${patients.length} Patients created`);

  // ==================== PATIENT HISTORIES ====================
  const histories = [
    { allergies: ["Penicillin", "Dust"], pastIllnesses: ["Dengue (2023)"], ongoingMedications: ["Cetirizine 10mg"], surgeries: [] },
    { allergies: ["Sulfa drugs"], pastIllnesses: ["Typhoid (2022)", "COVID-19 (2021)"], ongoingMedications: [], surgeries: ["Appendectomy (2020)"] },
    { allergies: [], pastIllnesses: ["Asthma (childhood)"], ongoingMedications: ["Inhaler – Asthalin"], surgeries: [] },
    { allergies: ["Peanuts", "Shellfish"], pastIllnesses: [], ongoingMedications: ["Metformin 500mg"], surgeries: ["Knee Arthroscopy (2023)"] },
    { allergies: ["Ibuprofen"], pastIllnesses: ["Malaria (2021)"], ongoingMedications: ["Atorvastatin 20mg", "Aspirin 75mg"], surgeries: [] },
    { allergies: [], pastIllnesses: [], ongoingMedications: [], surgeries: [] },
    { allergies: ["Latex"], pastIllnesses: ["Chickenpox (childhood)"], ongoingMedications: ["Thyronorm 50mcg"], surgeries: [] },
    { allergies: ["Amoxicillin"], pastIllnesses: ["Pneumonia (2022)"], ongoingMedications: [], surgeries: ["Tonsillectomy (2019)"] },
    { allergies: [], pastIllnesses: ["Jaundice (2020)"], ongoingMedications: ["Pantoprazole 40mg"], surgeries: [] },
    { allergies: ["Aspirin", "NSAIDS"], pastIllnesses: ["PCOD"], ongoingMedications: ["Folic acid", "Iron supplements"], surgeries: [] },
  ];

  for (let i = 0; i < patients.length; i++) {
    await PatientHistory.create({ patientId: patients[i]._id, ...histories[i] });
  }
  console.log("📋 Patient histories created");

  // ==================== APPOINTMENTS (Past - Completed) ====================
  const consultationTypes = ["In-Person", "Video Call", "Phone Call"];
  const reasons = [
    "Regular health checkup",
    "Persistent headache for 2 weeks",
    "Skin rash on arms and neck",
    "Follow-up for blood pressure medication",
    "Child has fever and cold for 3 days",
    "Back pain after lifting heavy objects",
    "Numbness in hands, need neurological evaluation",
    "Annual physical examination",
    "Chest pain during exercise",
    "Joint pain in knees, difficulty walking",
    "Acne treatment consultation",
    "Dizziness and frequent fainting spells",
    "Post-surgery follow-up",
    "Difficulty sleeping, fatigue",
    "Stomach pain and bloating after meals"
  ];

  const completedAppointments = [];

  // 15 completed appointments (past dates)
  for (let i = 0; i < 15; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const daysAgo = Math.floor(Math.random() * 30) + 5;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const slotIndex = i % 10;
    const timeSlots = ["09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM", "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM"];

    const appt = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: date,
      timeSlot: timeSlots[slotIndex],
      consultationType: consultationTypes[i % 3],
      reasonForVisit: reasons[i],
      status: "completed"
    });
    completedAppointments.push(appt);
  }

  // 5 confirmed upcoming appointments
  for (let i = 0; i < 5; i++) {
    const patient = patients[i];
    const doctor = doctors[i % doctors.length];
    const daysAhead = Math.floor(Math.random() * 7) + 1;
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(0, 0, 0, 0);

    // Mark slot as booked
    const slotIndex = i;
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await User.updateOne(
      { _id: doctor._id, "availability.date": { $gte: startOfDay, $lte: endOfDay } },
      { $set: { [`availability.$[day].slots.${slotIndex}.isBooked`]: true } },
      { arrayFilters: [{ "day.date": { $gte: startOfDay, $lte: endOfDay } }] }
    );

    const timeSlots = ["09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM"];
    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: date,
      timeSlot: timeSlots[slotIndex],
      consultationType: consultationTypes[i % 3],
      reasonForVisit: reasons[i + 5],
      status: "confirmed"
    });
  }

  // 3 pending appointments
  for (let i = 0; i < 3; i++) {
    const patient = patients[i + 5];
    const doctor = doctors[i + 3];
    const daysAhead = Math.floor(Math.random() * 5) + 2;
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(0, 0, 0, 0);

    const timeSlots = ["02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM"];
    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: date,
      timeSlot: timeSlots[i],
      consultationType: "In-Person",
      reasonForVisit: reasons[i + 10],
      status: "pending"
    });
  }

  // 2 cancelled appointments
  for (let i = 0; i < 2; i++) {
    const patient = patients[i + 8];
    const doctor = doctors[i];
    const daysAgo = Math.floor(Math.random() * 10) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: date,
      timeSlot: "03:30 PM - 04:00 PM",
      consultationType: "Video Call",
      reasonForVisit: reasons[i + 13],
      status: "cancelled"
    });
  }

  console.log("📅 25 Appointments created (15 completed, 5 confirmed, 3 pending, 2 cancelled)");

  // ==================== MEDICAL RECORDS ====================
  const diagnoses = [
    { diagnosis: "Hypertension Stage 1", symptoms: "High blood pressure, headache, dizziness", prescriptions: [
      { medicineName: "Amlodipine", dosage: "5mg", times: [{ time: "08:00 AM" }], durationInDays: 30, startDate: new Date() },
      { medicineName: "Losartan", dosage: "50mg", times: [{ time: "08:00 PM" }], durationInDays: 30, startDate: new Date() }
    ]},
    { diagnosis: "Contact Dermatitis", symptoms: "Red rash on arms, itching, swelling", prescriptions: [
      { medicineName: "Betamethasone Cream", dosage: "Apply twice daily", times: [{ time: "09:00 AM" }, { time: "09:00 PM" }], durationInDays: 14, startDate: new Date() },
      { medicineName: "Cetirizine", dosage: "10mg", times: [{ time: "10:00 PM" }], durationInDays: 7, startDate: new Date() }
    ]},
    { diagnosis: "Viral Fever with Upper Respiratory Infection", symptoms: "Fever 101°F, runny nose, sore throat, body ache", prescriptions: [
      { medicineName: "Paracetamol", dosage: "500mg", times: [{ time: "08:00 AM" }, { time: "02:00 PM" }, { time: "08:00 PM" }], durationInDays: 5, startDate: new Date() },
      { medicineName: "Azithromycin", dosage: "500mg", times: [{ time: "09:00 AM" }], durationInDays: 3, startDate: new Date() },
      { medicineName: "Cough Syrup (Benadryl)", dosage: "10ml", times: [{ time: "10:00 PM" }], durationInDays: 5, startDate: new Date() }
    ]},
    { diagnosis: "Lumbar Spondylosis", symptoms: "Lower back pain, stiffness, pain radiating to legs", prescriptions: [
      { medicineName: "Diclofenac", dosage: "50mg", times: [{ time: "08:00 AM" }, { time: "08:00 PM" }], durationInDays: 10, startDate: new Date() },
      { medicineName: "Calcium + Vitamin D3", dosage: "1 tablet", times: [{ time: "01:00 PM" }], durationInDays: 30, startDate: new Date() },
      { medicineName: "Thiocolchicoside", dosage: "4mg", times: [{ time: "09:00 PM" }], durationInDays: 7, startDate: new Date() }
    ]},
    { diagnosis: "Tension Headache", symptoms: "Persistent bilateral headache, pressure sensation, neck stiffness", prescriptions: [
      { medicineName: "Naproxen", dosage: "250mg", times: [{ time: "08:00 AM" }, { time: "08:00 PM" }], durationInDays: 5, startDate: new Date() }
    ]},
    { diagnosis: "Mild Iron Deficiency Anemia", symptoms: "Fatigue, pallor, dizziness, shortness of breath on exertion", prescriptions: [
      { medicineName: "Ferrous Sulphate", dosage: "200mg", times: [{ time: "09:00 AM" }], durationInDays: 60, startDate: new Date() },
      { medicineName: "Vitamin C", dosage: "500mg", times: [{ time: "09:00 AM" }], durationInDays: 60, startDate: new Date() }
    ]},
    { diagnosis: "Type 2 Diabetes Mellitus", symptoms: "Increased thirst, frequent urination, fatigue, blurred vision", prescriptions: [
      { medicineName: "Metformin", dosage: "500mg", times: [{ time: "08:00 AM" }, { time: "08:00 PM" }], durationInDays: 90, startDate: new Date() },
      { medicineName: "Glimepiride", dosage: "1mg", times: [{ time: "07:30 AM" }], durationInDays: 90, startDate: new Date() }
    ]},
    { diagnosis: "Acute Gastritis", symptoms: "Upper abdominal pain, nausea, bloating, loss of appetite", prescriptions: [
      { medicineName: "Pantoprazole", dosage: "40mg", times: [{ time: "07:00 AM" }], durationInDays: 14, startDate: new Date() },
      { medicineName: "Domperidone", dosage: "10mg", times: [{ time: "07:30 AM" }, { time: "12:30 PM" }, { time: "07:30 PM" }], durationInDays: 7, startDate: new Date() }
    ]},
  ];

  for (let i = 0; i < Math.min(completedAppointments.length, diagnoses.length); i++) {
    const appt = completedAppointments[i];
    const d = diagnoses[i];

    await MedicalRecord.create({
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      appointmentId: appt._id,
      diagnosis: d.diagnosis,
      symptoms: d.symptoms,
      prescriptions: d.prescriptions
    });
  }
  console.log("📄 8 Medical records with prescriptions created");

  // ==================== MEDICINE REMINDERS ====================
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const reminders = [
    { patientId: patients[0]._id, medicineName: "Amlodipine 5mg", dosage: "1 tablet", reminderDate: today, reminderTime: "08:00 AM", isTaken: true },
    { patientId: patients[0]._id, medicineName: "Losartan 50mg", dosage: "1 tablet", reminderDate: today, reminderTime: "08:00 PM", isTaken: false },
    { patientId: patients[1]._id, medicineName: "Betamethasone Cream", dosage: "Apply to rash", reminderDate: today, reminderTime: "09:00 AM", isTaken: true },
    { patientId: patients[1]._id, medicineName: "Cetirizine 10mg", dosage: "1 tablet", reminderDate: today, reminderTime: "10:00 PM", isTaken: false },
    { patientId: patients[2]._id, medicineName: "Paracetamol 500mg", dosage: "1 tablet", reminderDate: today, reminderTime: "08:00 AM", isTaken: true },
    { patientId: patients[2]._id, medicineName: "Paracetamol 500mg", dosage: "1 tablet", reminderDate: today, reminderTime: "02:00 PM", isTaken: true },
    { patientId: patients[2]._id, medicineName: "Paracetamol 500mg", dosage: "1 tablet", reminderDate: today, reminderTime: "08:00 PM", isTaken: false },
    { patientId: patients[3]._id, medicineName: "Diclofenac 50mg", dosage: "1 tablet", reminderDate: tomorrow, reminderTime: "08:00 AM", isTaken: false },
    { patientId: patients[4]._id, medicineName: "Metformin 500mg", dosage: "1 tablet", reminderDate: today, reminderTime: "08:00 AM", isTaken: true },
    { patientId: patients[4]._id, medicineName: "Metformin 500mg", dosage: "1 tablet", reminderDate: today, reminderTime: "08:00 PM", isTaken: false },
  ];

  await MedicineReminder.insertMany(reminders);
  console.log("💊 10 Medicine reminders created");

  // ==================== NOTIFICATIONS ====================
  const notifications = [
    { userId: patients[0]._id, message: "Your appointment with Dr. Priya Sharma has been confirmed for tomorrow at 09:00 AM.", type: "appointment", isRead: false },
    { userId: patients[0]._id, message: "Reminder: Take your Amlodipine 5mg at 08:00 AM.", type: "reminder", isRead: true },
    { userId: patients[1]._id, message: "Your appointment with Dr. Amit Patel has been completed. Please check your medical records.", type: "appointment", isRead: true },
    { userId: patients[2]._id, message: "Your appointment with Dr. Neha Gupta is scheduled for next week. Please arrive 10 minutes early.", type: "appointment", isRead: false },
    { userId: patients[3]._id, message: "New prescription added by Dr. Vikram Singh. Check your medical records.", type: "system", isRead: false },
    { userId: patients[4]._id, message: "Reminder: Take your Metformin 500mg at 08:00 PM.", type: "reminder", isRead: false },
    { userId: doctors[0]._id, message: "New appointment request from Aarav Joshi for tomorrow.", type: "appointment", isRead: false },
    { userId: doctors[1]._id, message: "Patient Sneha Reddy's follow-up is due this week.", type: "system", isRead: true },
    { userId: doctors[2]._id, message: "3 new appointments confirmed for this week.", type: "appointment", isRead: false },
    { userId: patients[5]._id, message: "Welcome to CureLink! Complete your profile for a better experience.", type: "system", isRead: false },
    { userId: patients[6]._id, message: "Your appointment has been cancelled as per your request.", type: "appointment", isRead: true },
    { userId: patients[7]._id, message: "Lab results are now available. Please consult your doctor.", type: "system", isRead: false },
  ];

  await Notification.insertMany(notifications);
  console.log("🔔 12 Notifications created");

  // ==================== PLATFORM ACTIVITY ====================
  const activities = [];

  // Patient registrations
  for (const p of patients) {
    activities.push({
      action: "Patient Registered",
      userId: p._id,
      targetId: p._id,
      targetType: "User",
      description: `Patient ${p.name} registered with email ${p.email}`
    });
  }

  // Doctor registrations
  for (const d of doctors) {
    activities.push({
      action: "Doctor Registered",
      userId: d._id,
      targetId: d._id,
      targetType: "User",
      description: `Doctor ${d.name} (${d.specialization}) registered on the platform`
    });
  }

  // Appointment activities
  for (const appt of completedAppointments.slice(0, 8)) {
    const patient = patients.find(p => p._id.equals(appt.patientId));
    const doctor = doctors.find(d => d._id.equals(appt.doctorId));
    activities.push({
      action: "Appointment Completed",
      userId: appt.patientId,
      targetId: appt._id,
      targetType: "Appointment",
      description: `Appointment completed: ${patient?.name} with Dr. ${doctor?.name}`
    });
  }

  await PlatformActivity.insertMany(activities);
  console.log("📊 Platform activities logged");

  // ==================== SUMMARY ====================
  console.log("\n========================================");
  console.log("🎉 SEED COMPLETE! Here are the logins:");
  console.log("========================================");
  console.log("Password for ALL accounts: password123\n");
  console.log("👑 ADMIN:    admin@curelink.com");
  console.log("🩺 DOCTORS:");
  for (const d of doctorsData) {
    console.log(`   ${d.email} (${d.specialization})`);
  }
  console.log("🧑 PATIENTS:");
  for (const p of patientsData) {
    console.log(`   ${p.email}`);
  }
  console.log("========================================\n");

  await mongoose.disconnect();
  console.log("✅ Done! Database disconnected.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
