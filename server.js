const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory bookings (for demo)
const bookings = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get bookings (for future use)
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// API endpoint to create a booking and send email
app.post('/api/bookings', async (req, res) => {
    const booking = req.body;
    // Check for booking conflict
    const conflict = bookings.some(b => b.date === booking.date && b.time === booking.time);
    if (conflict) {
        return res.status(409).json({ error: 'This time slot is already booked.' });
    }
    // Save booking
    bookings.push(booking);
    // Send confirmation email
    try {
        await sendConfirmationEmail(booking);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send confirmation email.' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Fingerprint Booking App is running' });
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shodichauke@gmail.com',
        pass: 'nnrz lzei djdz bmak',
    },
});

async function sendConfirmationEmail(booking) {
    const serviceNames = {
        'fingerprint': 'Fingerprint Capturing Only',
        'id-photo': 'ID Photo Shoot Only',
        'both': 'Both Services',
    };
    const formattedDate = new Date(booking.date).toLocaleDateString('en-ZA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = booking.time;
    const html = `
        <h2>Booking Confirmed!</h2>
        <p>Dear <b>${booking.name}</b>,</p>
        <p>Your appointment for <b>${serviceNames[booking.service]}</b> has been confirmed.</p>
        <ul>
            <li><b>Date:</b> ${formattedDate}</li>
            <li><b>Time:</b> ${formattedTime}</li>
            <li><b>Location:</b> 155 West Street, Sandton, Johannesburg</li>
        </ul>
        <p><b>Booking ID:</b> ${booking.id}</p>
        <p>Thank you for booking with us!</p>
        <hr>
        <p style="font-size:0.9em;color:#888;">ID Services | 155 West Street, Sandton</p>
    `;
    await transporter.sendMail({
        from: 'shodichauke@gmail.com',
        to: booking.email,
        subject: 'Your Booking Confirmation - ID Services',
        html,
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Fingerprint Booking App running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to the URL above`);
    console.log(`📋 Features: Booking appointments, receipt generation, print functionality, email confirmation`);
}); 