const Request = require('../models/Request');
const QRCode = require('qrcode');
const User = require('../models/User');
const Event = require('../models/Event');
const sendEmail = require('../utils/sendEmail'); // Assuming sendEmail is your utility to send emails

// CREATE new request
exports.createRequest = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const newRequest = new Request({
      userId,
      eventId,
      status: false,
      treated: false
    });

    await newRequest.save();

    // Send email confirmation after registration
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (user && event) {
      const eventDate = new Date(event.date).toLocaleDateString();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #15B4CE;"> You're Registered!</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Thank you for registering for the event. Here are your event details:</p>

          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">📌 Event</td>
              <td style="padding: 8px;">${event.title}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">📅 Date</td>
              <td style="padding: 8px;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📍 Location</td>
              <td style="padding: 8px;">${event.location}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">⏱️ Duration</td>
              <td style="padding: 8px;">${event.duration} hours</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">We will review your registration and get back to you shortly. We look forward to seeing you at the event!</p>
          <p>Best regards,</p>
        </div>
      `;

      await sendEmail(
        user.email,
        'Event Registration Successful',
        `You have registered for ${event.title} on ${eventDate}`,
        htmlContent
      );
    }

    res.status(201).json({ message: 'Request created and confirmation email sent', request: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// UPDATE (accept/reject) request and generate QR if accepted
exports.handleRequestDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findById(id)
      .populate('userId', 'username email')
      .populate('eventId', 'title date location duration');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.treated = true;

    const user = request.userId;
    const event = request.eventId;
    const formattedDate = event?.date
  ? new Date(event.date).toISOString().split('T')[0]
  : 'Unknown date';


    if (status === true) {
      // ✅ ACCEPTED
      const qrCodeData =
        `User ID: ${user._id}\n` +
        `Email: ${user.email}\n` +
        `Event: ${event.title}\n` +
        `Date: ${event.date.toISOString().split('T')[0]}`;

      const qrCodeImage = await QRCode.toDataURL(qrCodeData);
      request.qrCode = qrCodeImage;

      await request.save();

      // ✅ Send acceptance email with QR (inline attachment)
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #15B4CE;">🎉 You're Approved!</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Your request for the event <strong>${event.title}</strong> has been <strong style="color: green;">accepted</strong>.</p>
          
          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">📅 Date</td>
              <td style="padding: 8px;">${new Date(event.date).toLocaleDateString()}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">📍 Location</td>
              <td style="padding: 8px;">${event.location}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">⏱️ Duration</td>
              <td style="padding: 8px;">${event.duration} hours</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Please present this QR code at the entrance:</p>
          <img src="cid:qr-code-image" alt="QR Code" style="max-width: 300px; margin-top: 10px;" />
          
          <p style="margin-top: 20px;">We look forward to seeing you!</p>
          <p>— Team Fleep</p>
        </div>
      `;

      await sendEmail(
        user.email,
        `✅ Approved: ${event.title}`,
        `Your request for ${event.title} has been approved.`,
        htmlContent,
        qrCodeImage // Pass the QR code image as an attachment
      );

    } else if (status === false) {
      // ❌ REJECTED
      request.qrCode = null; // Clear QR if any
      await request.save();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f44336; border-radius: 10px;">
          <h2 style="color: #f44336;">❌ Request Rejected</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>We regret to inform you that your request for the event <strong>${event.title}</strong> has been <strong style="color: red;">rejected</strong>.</p>
          <p>Feel free to apply to other events in the future.</p>
          <p>— Team Fleep</p>
        </div>
      `;

      await sendEmail(
        user.email,
        `❌ Request Rejected: ${event.title}`,
        `Your request for ${event.title} was rejected.`,
        htmlContent
      );
    }

    res.status(200).json({
      message: 'Request updated and email sent',
      request: {
        _id: request._id,
        user: user,
        event: event,
        status: request.status,
        treated: request.treated,
        qrCode: request.qrCode
      }
    });
  } catch (error) {
    console.error('Error updating request:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Something went wrong', 
      error: error.message || 'Unknown error'
    });
  } 
};  
