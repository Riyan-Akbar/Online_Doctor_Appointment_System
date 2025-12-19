const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

// MongoDB Connection
// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/hospital_db')
.then(() => console.log('✅ MongoDB Connected!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas & Models ---

const DoctorSchema = new mongoose.Schema({
    id: Number, // Keeping simple ID for compatibility with existing frontend logic
    name: String,
    spec: String,
    rating: Number,
    reviews: Number,
    successRate: Number,
    experience: Number
});

const SlotSchema = new mongoose.Schema({
    id: Number,
    doctorId: Number,
    dateTime: String,
    isBooked: Boolean
});

const AppointmentSchema = new mongoose.Schema({
    id: Number,
    patient: String,
    doctorId: Number,
    slotId: Number,
    dateTime: String,
    status: String,
    prescription: String
});

const Doctor = mongoose.model('Doctor', DoctorSchema);
const Slot = mongoose.model('Slot', SlotSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// --- Routes ---

// 1. Doctors
app.get('/api/doctors', async (req, res) => {
    const doctors = await Doctor.find();
    res.json(doctors);
});

app.post('/api/doctors', async (req, res) => {
    const newDoc = new Doctor(req.body);
    await newDoc.save();
    res.json(newDoc);
});

app.put('/api/doctors/:id', async (req, res) => {
    const doc = await Doctor.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(doc);
});

app.delete('/api/doctors/:id', async (req, res) => {
    await Doctor.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted' });
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    const docsCount = await Doctor.countDocuments();
    const apps = await Appointment.find();
    
    // Financials
    const revenue = apps.filter(a => a.status === 'Paid' || a.status === 'Prescribed' || a.status === 'Dispensed').length * 50; // $50 per paid app
    
    // Reviews (Mock aggregation)
    const reviews = 428; 

    // System Health (Mock)
    const uptime = "99.98%";
    const downtime = "2m 14s";
    const issues = 0;

    res.json({
        revenue,
        docsCount,
        reviews,
        uptime,
        downtime,
        issues
    });
});

// 2. Slots
app.get('/api/slots', async (req, res) => {
    const slots = await Slot.find();
    res.json(slots);
});

app.post('/api/slots', async (req, res) => {
    const newSlot = new Slot(req.body);
    await newSlot.save();
    res.json(newSlot);
});

app.put('/api/slots/:id', async (req, res) => {
    const { isBooked } = req.body;
    const slot = await Slot.findOneAndUpdate({ id: req.params.id }, { isBooked }, { new: true });
    res.json(slot);
});

// 3. Appointments
app.get('/api/appointments', async (req, res) => {
    const apps = await Appointment.find();
    res.json(apps);
});

app.post('/api/appointments', async (req, res) => {
    const newApp = new Appointment(req.body);
    await newApp.save();
    res.json(newApp);
});

app.put('/api/appointments/:id', async (req, res) => {
    const app = await Appointment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(app);
});

app.delete('/api/appointments/:id', async (req, res) => {
    await Appointment.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted' });
});

// --- Seed Data (Initialize if empty) ---
async function seedData() {
    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
        console.log('🌱 Seeding Initial Data...');
        await Doctor.insertMany([
            { id: 1, name: "Dr. Vaibhav Anand", spec: "Cardiology", rating: 4.9, reviews: 120, successRate: 98, experience: 12 },
            { id: 2, name: "Dr. Riyan Akbar", spec: "Neurologist", rating: 4.8, reviews: 85, successRate: 95, experience: 8 },
            { id: 3, name: "Dr. Tanay Sinha", spec: "General Physician", rating: 4.7, reviews: 200, successRate: 99, experience: 15 },
        ]);
        
        await Slot.insertMany([
            { id: 101, doctorId: 1, dateTime: "2025-12-20T10:00", isBooked: false },
            { id: 102, doctorId: 1, dateTime: "2025-12-20T11:00", isBooked: false },
            { id: 103, doctorId: 2, dateTime: "2025-12-21T09:00", isBooked: false },
        ]);
        console.log('✅ Data Seeded');
    }
}
seedData();

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
