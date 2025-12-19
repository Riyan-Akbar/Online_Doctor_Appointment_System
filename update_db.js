const mongoose = require('mongoose');

// --- Doctor Schema (Matches server.js) ---
const DoctorSchema = new mongoose.Schema({
    id: Number,
    name: String,
    spec: String,
    rating: Number,
    reviews: Number,
    successRate: Number,
    experience: Number
});

const Doctor = mongoose.model('Doctor', DoctorSchema);

// --- Connect & Update ---
mongoose.connect('mongodb://127.0.0.1:27017/hospital_db')
.then(async () => {
    console.log('✅ Connected to MongoDB');

    const updates = [
        { id: 1, rating: 4.9, reviews: 120, successRate: 98, experience: 12 },
        { id: 2, rating: 4.8, reviews: 85, successRate: 95, experience: 8 },
        { id: 3, rating: 4.7, reviews: 200, successRate: 99, experience: 15 },
    ];

    for (const update of updates) {
        await Doctor.findOneAndUpdate({ id: update.id }, update);
        console.log(`Updated Doctor ID: ${update.id}`);
    }

    console.log('🎉 Database Updated!');
    process.exit();
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
