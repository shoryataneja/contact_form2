import './ContactForm.css'

export default function ContactForm() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-info">
          <h1>Contact Us</h1>
          <p>Have a question or need help? We'd love to hear from you. Fill out the form and we'll get back to you shortly.</p>

          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <strong>Address</strong>
              <p>123 Market Street, Suite 400<br />San Francisco, CA 94105</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <strong>Phone</strong>
              <p>+1 (800) 123-4567</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">✉️</span>
            <div>
              <strong>Email</strong>
              <p>support@example.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🕐</span>
            <div>
              <strong>Business Hours</strong>
              <p>Mon – Fri: 9:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={e => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" placeholder="Doe" />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="+1 (555) 000-0000" />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <select>
              <option value="">Select a subject</option>
              <option>General Inquiry</option>
              <option>Order Support</option>
              <option>Returns & Refunds</option>
              <option>Product Information</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea rows="5" placeholder="Write your message here..."></textarea>
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" id="agree" />
            <label htmlFor="agree">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  )
}
