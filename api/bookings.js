import nodemailer from 'nodemailer';

// In-memory bookings (per function instance, not persistent)
let bookings = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const booking = req.body;
    
    // Check for maintenance dates
    const maintenanceDates = ['2025-07-31', '2025-08-01'];
    if (maintenanceDates.includes(booking.date)) {
      return res.status(400).json({ 
        error: 'This date is unavailable due to building maintenance. Please select a different date.' 
      });
    }
    
    // Check for booking conflict
    const conflict = bookings.some(b => b.date === booking.date && b.time === booking.time);
    if (conflict) {
      return res.status(409).json({ error: 'This time slot is already booked.' });
    }
    bookings.push(booking);
    try {
      await sendConfirmationEmail(booking);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to send confirmation email.' });
    }
  } else if (req.method === 'GET') {
    res.status(200).json(bookings);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: booking.email,
    subject: 'Your Booking Confirmation - ID Services',
    html,
  });
} 