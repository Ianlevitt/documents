import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// File path for persistent storage
const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.json');

// Load existing bookings from file
function loadBookings() {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
  return [];
}

// Manual list of existing customers (add more emails as needed)
const EXISTING_CUSTOMERS = [
    'sammachine07@gmail.com',
    'delitojunior23@gmail.com',
    'imahovan@gmail.com',
    'siyabongamatavele@gmail.com',
    // Add more customer emails here as needed
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Load bookings from file
      const bookings = loadBookings();
      
      // Get all unique email addresses from bookings + existing customers
      const bookingEmails = bookings.map(booking => booking.email);
      const allEmails = [...new Set([...bookingEmails, ...EXISTING_CUSTOMERS])];
      
      if (allEmails.length === 0) {
        return res.status(200).json({ message: 'No users to notify' });
      }

      // Send maintenance notification to all users
      const notificationPromises = allEmails.map(email => 
        sendMaintenanceNotification(email)
      );
      
      await Promise.all(notificationPromises);
      
      res.status(200).json({ 
        success: true, 
        message: `Maintenance notification sent to ${allEmails.length} users`,
        usersNotified: allEmails.length,
        emails: allEmails
      });
    } catch (err) {
      console.error('Error sending maintenance notifications:', err);
      res.status(500).json({ error: 'Failed to send maintenance notifications.' });
    }
  } else if (req.method === 'GET') {
    // Return maintenance dates for frontend validation
    const maintenanceDates = ['2025-07-31', '2025-08-01'];
    res.status(200).json({ maintenanceDates });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function sendMaintenanceNotification(email) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; text-align: center;">⚠️ Maintenance Notice</h2>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b6b;">
        <h3 style="color: #2c3e50; margin-top: 0;">Building Maintenance Schedule</h3>
        
        <p style="color: #34495e; line-height: 1.6;">
          Dear valued customer,
        </p>
        
        <p style="color: #34495e; line-height: 1.6;">
          We would like to inform you about scheduled building maintenance that will affect our services.
        </p>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
          <h4 style="color: #e74c3c; margin-top: 0;">📅 Maintenance Dates:</h4>
          <ul style="color: #2c3e50;">
            <li><strong>Thursday, July 31, 2025</strong></li>
            <li><strong>Friday, August 1, 2025</strong></li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <h4 style="color: #856404; margin-top: 0;">⚠️ What to Expect:</h4>
          <ul style="color: #856404;">
            <li>No electricity available</li>
            <li>Network connectivity will be down</li>
            <li>All appointments on these dates are cancelled</li>
            <li>No fingerprint capturing or ID photo services</li>
          </ul>
        </div>
        
        <p style="color: #34495e; line-height: 1.6;">
          <strong>Important:</strong> If you have any appointments scheduled for these dates, they have been automatically cancelled. 
          Please reschedule your appointment for a different date.
        </p>
        
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <h4 style="color: #155724; margin-top: 0;">✅ What You Can Do:</h4>
          <ul style="color: #155724;">
            <li>Book a new appointment for any other available date</li>
            <li>Contact us if you need assistance with rescheduling</li>
            <li>We apologize for any inconvenience caused</li>
          </ul>
        </div>
        
        <p style="color: #34495e; line-height: 1.6;">
          We appreciate your understanding and patience during this maintenance period. 
          Normal services will resume on Saturday, August 2, 2025.
        </p>
        
        <p style="color: #34495e; line-height: 1.6;">
          Thank you for choosing ID Services.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 0.9em;">
          ID Services | 155 West Street, Sandton, Johannesburg
        </p>
      </div>
    </div>
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
    to: email,
    subject: '⚠️ Maintenance Notice - ID Services (July 31 & August 1)',
    html,
  });
} 