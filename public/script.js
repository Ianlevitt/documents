// Global variables
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// Maintenance dates - Thursday and Friday this week
const MAINTENANCE_DATES = ['2025-07-31', '2025-08-01']; // Thursday and Friday

// Restricted time for Saturday August 2nd
const RESTRICTED_DATE = '2025-08-02'; // Saturday
const ALLOWED_TIME_ON_RESTRICTED_DATE = '14:00'; // Only 2:00 PM allowed

// DOM elements
const bookingForm = document.getElementById('bookingForm');
const receiptModal = document.getElementById('receiptModal');
const receiptContent = document.getElementById('receiptContent');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setMinDate();
    // Removed automatic notification sending
});



// Set minimum date to today and disable maintenance dates
function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Add event listener to disable maintenance dates and handle restricted times
    dateInput.addEventListener('change', function() {
        const selectedDate = this.value;
        if (MAINTENANCE_DATES.includes(selectedDate)) {
            showError('This date is unavailable due to building maintenance. Please select a different date.');
            this.value = '';
            return;
        }
        
        // Handle restricted time for Saturday August 2nd
        if (selectedDate === RESTRICTED_DATE) {
            const timeSelect = document.getElementById('time');
            // Disable all time options except 14:00
            Array.from(timeSelect.options).forEach(option => {
                if (option.value !== '' && option.value !== ALLOWED_TIME_ON_RESTRICTED_DATE) {
                    option.disabled = true;
                    option.style.color = '#ccc';
                }
            });
            
            // Set the time to 14:00 if no time is selected
            if (!timeSelect.value || timeSelect.value === '') {
                timeSelect.value = ALLOWED_TIME_ON_RESTRICTED_DATE;
            }
            
            showError('On Saturday August 2nd, only 2:00 PM appointments are available.');
        } else {
            // Re-enable all time options for other dates
            const timeSelect = document.getElementById('time');
            Array.from(timeSelect.options).forEach(option => {
                option.disabled = false;
                option.style.color = '';
            });
        }
    });
}

// Check if date is during maintenance
function isMaintenanceDate(date) {
    return MAINTENANCE_DATES.includes(date);
}

// Initialize form with event listeners
function initializeForm() {
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Add real-time validation
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Handle form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }
    const formData = new FormData(bookingForm);
    const bookingData = {
        id: generateBookingId(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        notes: formData.get('notes'),
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };
    // Show loading state
    const submitBtn = bookingForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (res.status === 409) {
            showError('This time slot is already booked. Please select a different time.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        if (!res.ok) {
            showError('Failed to book appointment. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
        showReceipt(bookingData);
        bookingForm.reset();
        setMinDate();
    } catch (err) {
        showError('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Generate unique booking ID
function generateBookingId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    return `BK${timestamp}${random}`.toUpperCase();
}

// Check for booking conflicts
function isBookingConflict(newBooking) {
    return bookings.some(booking => 
        booking.date === newBooking.date && 
        booking.time === newBooking.time &&
        booking.status === 'confirmed'
    );
}

// Validate form
function validateForm() {
    const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate email format
    const email = document.getElementById('email');
    if (email.value && !isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone format
    const phone = document.getElementById('phone');
    if (phone.value && !isValidPhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate date (not in the past)
    const date = document.getElementById('date');
    if (date.value) {
        const selectedDate = new Date(date.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFieldError(date, 'Please select a future date');
            isValid = false;
        }
        
        // Check for maintenance dates
        if (isMaintenanceDate(date.value)) {
            showFieldError(date, 'This date is unavailable due to building maintenance');
            isValid = false;
        }
        
        // Check for restricted date and time
        if (date.value === RESTRICTED_DATE) {
            const timeSelect = document.getElementById('time');
            if (timeSelect.value !== ALLOWED_TIME_ON_RESTRICTED_DATE) {
                showFieldError(timeSelect, 'On Saturday August 2nd, only 2:00 PM appointments are available');
                isValid = false;
            }
        }
    }
    
    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (!value && field.hasAttribute('required')) {
        showFieldError(field, 'This field is required');
        return;
    }
    
    // Specific validations
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return;
    }
    
    if (field.name === 'phone' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return;
    }
    
    clearFieldError(field);
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.85rem';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
}

// Show general error
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Confetti animation
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let confetti = [];
    for (let i = 0; i < 120; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 80 + 40,
            color: `hsl(${Math.random()*360}, 70%, 60%)`,
            tilt: Math.random() * 10 - 10,
            tiltAngle: 0,
            tiltAngleIncremental: (Math.random() * 0.07) + 0.05
        });
    }
    let angle = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < confetti.length; i++) {
            let c = confetti[i];
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + (c.r/3), c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.d/10);
            ctx.stroke();
        }
        update();
    }
    function update() {
        angle += 0.01;
        for (let i = 0; i < confetti.length; i++) {
            let c = confetti[i];
            c.y += (Math.cos(angle + c.d) + 3 + c.r/2) / 2;
            c.x += Math.sin(angle);
            c.tiltAngle += c.tiltAngleIncremental;
            c.tilt = Math.sin(c.tiltAngle) * 15;
            if (c.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: c.tilt,
                    tiltAngle: c.tiltAngle,
                    tiltAngleIncremental: c.tiltAngleIncremental
                };
            }
        }
    }
    let confettiInterval = setInterval(draw, 16);
    setTimeout(() => {
        clearInterval(confettiInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 2500);
}

// Show receipt modal
function showReceipt(bookingData) {
    const receiptHTML = generateReceiptHTML(bookingData);
    receiptContent.innerHTML = receiptHTML;
    receiptModal.style.display = 'block';
    receiptModal.style.animation = 'fadeIn 0.3s ease';
    launchConfetti();
}

// Generate receipt HTML
function generateReceiptHTML(bookingData) {
    const serviceNames = {
        'fingerprint': 'Fingerprint Capturing Only',
        'id-photo': 'ID Photo Shoot Only',
        'both': 'Both Services'
    };
    
    const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = new Date(`2000-01-01T${bookingData.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    return `
        <div class="receipt-header">
            <h3><i class="fas fa-check-circle" style="color: #27ae60;"></i> Booking Confirmed!</h3>
            <p>Your appointment has been successfully scheduled</p>
        </div>
        
        <div class="booking-details">
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingData.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${bookingData.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${bookingData.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${bookingData.phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${serviceNames[bookingData.service]}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${formattedTime}</span>
            </div>
            ${bookingData.notes ? `
            <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${bookingData.notes}</span>
            </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #27ae60;">Confirmed</span>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h4 style="color: #2c3e50; margin-bottom: 10px;"><i class="fas fa-info-circle"></i> Important Information</h4>
            <ul style="color: #7f8c8d; line-height: 1.6;">
                <li>Please arrive 10 minutes before your scheduled appointment</li>
                <li>Bring a valid ID document for verification</li>
                <li>Dress appropriately for ID photo requirements</li>
                <li>Payment will be collected at the office</li>
                <li>Contact us at +27 11 234 5678 for any changes</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <p style="color: #27ae60; font-weight: 600; margin: 0;">
                <i class="fas fa-map-marker-alt"></i> 
                Office Address: 155 West Street, Sandton, Johannesburg
            </p>
        </div>
    `;
}

// Close modal
function closeModal() {
    receiptModal.style.display = 'none';
}

// Print receipt
function printReceipt() {
    const printWindow = window.open('', '_blank');
    const receiptHTML = receiptContent.innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Booking Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .receipt-header { text-align: center; margin-bottom: 30px; }
                .booking-details { margin-bottom: 30px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; }
                .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${receiptHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === receiptModal) {
        closeModal();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
`;
document.head.appendChild(style); 