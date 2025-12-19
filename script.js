// --- 1. SETUP & INITIALIZATION ---

const API_URL = 'http://localhost:3000/api';

// AUTH: Check Login Status
const path = window.location.pathname;
const page = path.split("/").pop();

if (page !== "index.html" && page !== "") {
    if (!sessionStorage.getItem("user")) {
        window.location.href = "index.html";
    }
}

// AUTH: Login Function
function login() {
    const role = document.getElementById("userRole").value;
    const username = document.getElementById("username").value;

    if (!username) {
        alert("Please enter a username");
        return;
    }

    sessionStorage.setItem("user", JSON.stringify({ name: username, role: role }));
    
    // Redirect based on role
    if (role === "patient") window.location.href = "patient.html";
    else if (role === "doctor") window.location.href = "doctor.html";
    else if (role === "pharmacist") window.location.href = "pharmacist.html";
    else if (role === "admin") window.location.href = "admin.html";
}

// --- 2. DATA FETCHING (ASYNC) ---

async function getDoctors() {
    const res = await fetch(`${API_URL}/doctors`);
    return await res.json();
}

async function getSlots() {
    const res = await fetch(`${API_URL}/slots`);
    return await res.json();
}

async function getApps() {
    const res = await fetch(`${API_URL}/appointments`);
    return await res.json();
}

// --- 3. CORE FUNCTIONS ---

// Filter Doctors and Slots
async function filterDoctors() {
    // const searchText = document.getElementById('searchInput').value.toLowerCase();
    const docId = document.getElementById('doctorSelect').value;
    const specFilter = document.getElementById('specFilter').value;
    const slotSelect = document.getElementById('slotSelect');

    const slots = await getSlots();
    const docs = await getDoctors();

    slotSelect.innerHTML = '';

    const filteredSlots = slots.filter(slot => {
        if (slot.isBooked) return false;
        
        const doc = docs.find(d => d.id === slot.doctorId);
        if (!doc) return false;

        // const matchesName = doc.name.toLowerCase().includes(searchText);
        const matchesDoc = docId === "" || doc.id == docId;
        const matchesSpec = specFilter === "" || doc.spec === specFilter;

        return matchesDoc && matchesSpec;
    });

    const docInfoCard = document.getElementById('docInfoCard');
    const selectedDoc = docs.find(d => d.id == docId);

    if (selectedDoc) {
        docInfoCard.style.display = 'block';
        document.getElementById('docName').innerText = selectedDoc.name;
        document.getElementById('docSpec').innerText = selectedDoc.spec;
        document.getElementById('docRating').innerText = selectedDoc.rating || "N/A";
        document.getElementById('docReviews').innerText = selectedDoc.reviews || "0";
        document.getElementById('docSuccess').innerText = (selectedDoc.successRate || "0") + "%";
        document.getElementById('docExp').innerText = (selectedDoc.experience || "0") + " Yrs";
    } else {
        docInfoCard.style.display = 'none';
    }

    if (filteredSlots.length === 0) {
        const option = document.createElement('option');
        option.innerText = "No slots match criteria";
        slotSelect.appendChild(option);
    } else {
        filteredSlots.forEach(slot => {
            const doc = docs.find(d => d.id === slot.doctorId);
            const option = document.createElement('option');
            option.value = slot.id;
            const [date, time] = slot.dateTime.split('T');
            option.innerText = `${date} @ ${time} - ${doc.name} (${doc.spec})`;
            slotSelect.appendChild(option);
        });
    }
}

// ADMIN: Remove Doctor
async function removeDoctor(docId) {
    // Note: In a real app, this would be a DELETE request to an API endpoint that handles cascading deletes.
    // For now, we will just alert as we need backend route updates for full delete support.
    alert("Delete functionality requires backend implementation updates. Please focus on Booking flow.");
}

// PATIENT: Book Appointment
async function bookAppointment(patientName, slotId) {
    const slots = await getSlots();
    const selectedSlot = slots.find((s) => s.id == slotId); // Type coercion for ID

    if (selectedSlot.isBooked) {
        alert("Error: This slot is already booked.");
        return;
    }

    // 1. Mark Slot Booked (API)
    await fetch(`${API_URL}/slots/${slotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBooked: true })
    });

    // 2. Create Appointment (API)
    const newApp = {
        id: Date.now(),
        patient: patientName,
        doctorId: selectedSlot.doctorId,
        dateTime: selectedSlot.dateTime,
        slotId: parseInt(slotId),
        status: "Unpaid",
        prescription: "",
    };

    await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
    });

    location.href = `payment.html?appId=${newApp.id}`;
}

// PATIENT: Cancel Appointment
async function patientCancelAppointment(appId, slotId) {
    if (!confirm("Cancel this appointment?")) return;

    // 1. Delete Appointment
    await fetch(`${API_URL}/appointments/${appId}`, { method: 'DELETE' });

    // 2. Free Slot
    await fetch(`${API_URL}/slots/${slotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBooked: false })
    });

    alert("Cancelled!");
    location.reload();
}

// DOCTOR: Prescribe
async function prescribeMedicine(appId) {
    const medicine = prompt("Enter Medicine / Diagnosis:");
    // const medicine = "Aspirin 500mg"; // Auto-fill for testing
    if (medicine) {
        await fetch(`${API_URL}/appointments/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "Prescribed", prescription: medicine })
        });
        location.reload();
    }
}

// PHARMACIST: Dispense
async function dispenseMedicine(appId) {
    await fetch(`${API_URL}/appointments/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "Dispensed" })
    });
    location.reload();
}

// DOCTOR: Add Slot
async function addSlot() {
    const docId = document.getElementById('docIdInput').value;
    const dateTime = document.getElementById('slotTime').value;

    if (!docId || !dateTime) {
        alert("Enter ID and Time");
        return;
    }

    const newSlot = {
        id: Date.now(),
        doctorId: parseInt(docId),
        dateTime: dateTime,
        isBooked: false
    };

    await fetch(`${API_URL}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
    });
    
    alert("Slot Added!");
    location.reload();
}

// --- 4. UI RENDERERS ---

// Patient Slot Dropdown (Init)
if (document.getElementById("slotSelect")) {
    (async () => {
        await populateDoctorSelect();
        filterDoctors();
    })();
}

// Populate Doctor Select
async function populateDoctorSelect() {
    const docSelect = document.getElementById('doctorSelect');
    if (!docSelect) return;
    
    const docs = await getDoctors();
    docs.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.innerText = `${doc.name} (${doc.spec})`;
        docSelect.appendChild(option);
    });
}

// Patient Table
if (document.getElementById("patientTable")) {
    (async () => {
        const tbody = document.querySelector("#patientTable tbody");
        const apps = await getApps();
        const docs = await getDoctors();

        tbody.innerHTML = "";
        apps.forEach((app) => {
            const doc = docs.find((d) => d.id === app.doctorId);
            let statusText = app.status;
            let statusStyle = "";
            let actionButton = "";

            if (app.status === "Unpaid") {
                statusStyle = "color: var(--danger-color);";
                statusText = 'Unpaid - <a href="payment.html?appId=' + app.id + '">Pay Now</a>';
                actionButton = `<button class="btn-danger btn-sm" onclick="patientCancelAppointment(${app.id}, ${app.slotId})">Cancel</button>`;
            } else if (app.status === "Paid") {
                statusStyle = "color: var(--warning-color);";
                actionButton = `<button class="btn-danger btn-sm" onclick="patientCancelAppointment(${app.id}, ${app.slotId})">Cancel</button>`;
            } else if (app.status === "Prescribed") {
                statusStyle = "color: var(--primary-color);";
                statusText = "Awaiting Dispense";
            } else if (app.status === "Dispensed") {
                statusStyle = "color: var(--success-color); font-weight: bold;";
                statusText = "Completed";
            }

            tbody.innerHTML += `
                <tr>
                    <td>${doc ? doc.name : "Unknown"}</td>
                    <td>${app.dateTime ? app.dateTime.replace("T", " at ") : "N/A"}</td>
                    <td style="${statusStyle}">${statusText}</td>
                    <td>${app.prescription || "N/A"}</td>
                    <td>${actionButton}</td> </tr>`;
        });
    })();
}

// Doctor Table
if (document.getElementById("doctorTable")) {
    (async () => {
        const tbody = document.querySelector("#doctorTable tbody");
        const appsRaw = await getApps();
        const apps = appsRaw.filter(a => a.status === "Paid" || a.status === "Prescribed");

        tbody.innerHTML = "";
        apps.forEach((app) => {
            let actionButtons = "";
            if (app.status === "Paid") {
                actionButtons = `<button class="btn-success btn-sm" onclick="prescribeMedicine(${app.id})">Issue Prescription</button>`;
            } else if (app.status === "Prescribed") {
                actionButtons = `<em>Prescribed.</em>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${app.patient}</td>
                    <td>${app.dateTime ? app.dateTime.split("T")[1] : "N/A"}</td>
                    <td>${app.status}</td>
                    <td>${actionButtons}</td>
                </tr>`;
        });
    })();
}

// Pharmacist Table
if (document.getElementById("pharmacistTable")) {
    (async () => {
        const tbody = document.querySelector("#pharmacistTable tbody");
        const appsRaw = await getApps();
        const apps = appsRaw.filter(a => a.status === "Prescribed" || a.status === "Dispensed");
        const docs = await getDoctors();

        tbody.innerHTML = "";
        apps.forEach((app) => {
            const doc = docs.find(d => d.id === app.doctorId);
            let actionButton = "";
            if (app.status === "Prescribed") {
                actionButton = `<button class="btn-primary btn-sm" onclick="dispenseMedicine(${app.id})">Dispense</button>`;
            } else {
                actionButton = `<em>Completed</em>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${app.patient}</td>
                    <td>${doc ? doc.name : "Unknown"}</td>
                    <td>${app.prescription}</td>
                    <td>${app.status}</td>
                    <td>${actionButton}</td>
                </tr>`;
        });
    })();
}

// --- ADMIN DASHBOARD ---
if (document.getElementById('doctorListTable')) {
    initAdminDashboard();
}

async function initAdminDashboard() {
    loadStats();
    loadDoctorsTable();
    setupAdminForm();
}

async function loadStats() {
    const res = await fetch(`${API_URL}/admin/stats`);
    const data = await res.json();
    
    document.getElementById('totalRevenue').innerText = `$${data.revenue}`;
    document.getElementById('sysUptime').innerText = data.uptime;
    document.getElementById('totalDocs').innerText = data.docsCount;
    document.getElementById('activeIssues').innerText = data.issues;
}

async function loadDoctorsTable() {
    const tbody = document.querySelector('#doctorListTable tbody');
    const docs = await getDoctors();
    
    tbody.innerHTML = '';
    docs.forEach(doc => {
        tbody.innerHTML += `
            <tr>
                <td>${doc.name}</td>
                <td>${doc.spec}</td>
                <td>${doc.experience || '-'} Yrs</td>
                <td>⭐ ${doc.rating || '-'}</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="editDoctor(${doc.id})">Edit</button>
                    <button class="btn-danger btn-sm" onclick="deleteDoctor(${doc.id})">Delete</button>
                </td>
            </tr>`;
    });
}

function setupAdminForm() {
    const form = document.getElementById("adminForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const id = document.getElementById("editDocId").value;
        const name = document.getElementById("docName").value;
        const spec = document.getElementById("docSpec").value;
        const exp = document.getElementById("docExp").value;
        const rating = document.getElementById("docRating").value;

        const baseData = {
            name, 
            spec, 
            experience: exp ? parseInt(exp) : 0, 
            rating: rating ? parseFloat(rating) : 0
        };

        if (id) {
            // Update: Send ONLY the fields we edited. 
            // We do NOT send reviews or successRate so they remain unchanged in DB.
            await fetch(`${API_URL}/doctors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(baseData)
            });
            alert("Doctor Updated!");
        } else {
            // Create: Add defaults for new doctors
            const newDoc = {
                ...baseData,
                id: Date.now(),
                reviews: 0, 
                successRate: 100
            };
            
            await fetch(`${API_URL}/doctors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDoc)
            });
            alert("Doctor Added!");
        }

        resetForm();
        loadDoctorsTable();
        loadStats();
    });
}

// Global functions for inline onclick access
window.deleteDoctor = async function(id) {
    if(!confirm("Are you sure you want to delete this doctor?")) return;
    await fetch(`${API_URL}/doctors/${id}`, { method: 'DELETE' });
    loadDoctorsTable();
    loadStats();
}

window.editDoctor = async function(id) {
    const docs = await getDoctors();
    const doc = docs.find(d => d.id === id);
    if (!doc) return;

    document.getElementById("editDocId").value = doc.id;
    document.getElementById("docName").value = doc.name;
    document.getElementById("docSpec").value = doc.spec;
    document.getElementById("docExp").value = doc.experience || "";
    document.getElementById("docRating").value = doc.rating || "";

    document.getElementById("formTitle").innerText = "Edit Doctor";
    document.getElementById("submitBtn").innerText = "Update Doctor";
    document.getElementById("submitBtn").className = "btn-primary"; // Change color to blue
    document.getElementById("cancelEdit").style.display = "block";
}

window.resetForm = function() {
    document.getElementById("adminForm").reset();
    document.getElementById("editDocId").value = "";
    document.getElementById("formTitle").innerText = "Add New Doctor";
    document.getElementById("submitBtn").innerText = "Add Doctor";
    document.getElementById("submitBtn").className = "btn-success";
    document.getElementById("cancelEdit").style.display = "none";
}

// Booking Form Listener
const bookForm = document.getElementById("bookingForm");
if (bookForm) {
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("pName").value;
    const slotId = document.getElementById("slotSelect").value;
    if (slotId) {
      bookAppointment(name, slotId);
    } else {
      alert("Please select an available slot.");
    }
  });
}
