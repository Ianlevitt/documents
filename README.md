# Fingerprint & ID Photo Booking System

A modern, responsive web application for booking fingerprint capturing and ID photo shoot appointments at 155 West Street, Sandton, Johannesburg.

## 🚀 Features

### Core Functionality
- **Easy Booking Process**: Simple form to book appointments
- **Service Selection**: Choose between fingerprint capturing, ID photo shoot, or both services
- **Date & Time Selection**: Pick your preferred appointment slot
- **Real-time Validation**: Form validation with helpful error messages
- **Booking Conflict Prevention**: Prevents double-booking of time slots
- **Receipt Generation**: Instant booking confirmation with detailed receipt
- **Print Functionality**: Print booking receipts for records

### User Experience
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Professional Branding**: Clean, trustworthy appearance
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Error Handling**: Clear error messages and validation feedback

### Technical Features
- **Local Storage**: Bookings saved locally in browser
- **Unique Booking IDs**: Each booking gets a unique identifier
- **Data Persistence**: Bookings remain after page refresh
- **Cross-browser Compatible**: Works on all modern browsers

## 📋 Requirements

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## 🛠️ Installation & Setup

### Option 1: Quick Start (Recommended)
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Option 2: Development Mode
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to the URL shown in the terminal

### Option 3: Static Files Only
If you prefer to run without Node.js:
1. Simply open `index.html` in your web browser
2. All functionality will work locally

## 📱 How to Use

### Making a Booking
1. **Fill in your details:**
   - Full name
   - Email address
   - Phone number

2. **Select your service:**
   - Fingerprint Capturing Only
   - ID Photo Shoot Only
   - Both Services

3. **Choose date and time:**
   - Select from available time slots
   - Dates are limited to future dates only

4. **Add notes (optional):**
   - Any special requirements or notes

5. **Submit booking:**
   - Click "Book Appointment"
   - Review your receipt
   - Print or save the confirmation

### Receipt Features
- **Booking ID**: Unique identifier for your appointment
- **Service Details**: What you've booked
- **Appointment Info**: Date, time, and location
- **Important Notes**: What to bring and expect
- **Print Option**: Save a copy for your records

## 🏢 Office Information

**Address:** 155 West Street, Sandton, Johannesburg  
**Business Hours:**
- Monday - Friday: 9:00 AM - 5:00 PM
- Saturday: 9:00 AM - 2:00 PM

**Contact:** +27 11 234 5678

## 🎨 Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- Update the gradient background in the CSS
- Adjust card styling and animations

### Functionality
- Edit `script.js` to modify booking logic
- Add new validation rules
- Customize receipt format

### Content
- Update office information in `index.html`
- Modify service options
- Change business hours and contact details

## 🔧 Technical Details

### File Structure
```
booking/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── server.js           # Express server
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Deployment

### Local Development
The app runs locally and stores data in browser localStorage.

### Production Deployment
For production deployment:
1. Add a database (MongoDB, PostgreSQL, etc.)
2. Implement user authentication
3. Add email notifications
4. Set up SSL certificate
5. Deploy to platforms like:
   - Heroku
   - Vercel
   - Netlify
   - AWS
   - DigitalOcean

## 📞 Support

For technical support or questions:
- Email: support@idservices.com
- Phone: +27 11 234 5678
- Office Hours: Monday - Friday, 9:00 AM - 5:00 PM

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for professional ID services** 