import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.EMAIL_PORT) || 2525,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

export const sendMail = async (to: string, subject: string, html: string, text?: string) => {
  // If no SMTP credentials are provided or if they are mock values, fall back to console logging
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'mock_user' || process.env.EMAIL_USER.includes('mock')) {
    console.log(`================[ MOCK EMAIL SENT ]================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:\n${html.replace(/<[^>]*>/g, '')}`);
    console.log(`====================================================`);
    return { messageId: 'mock-id-' + Date.now() };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Policy Advisor" <no-reply@PolicyAdvisor.com>',
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Return mock success so the application does not crash
    return { error };
  }
};

export const sendAppointmentConfirmation = async (
  email: string,
  name: string,
  date: string,
  timeSlot: string,
  type: string,
  advisorName: string
) => {
  const subject = `Consultation Booked - Policy Advisor`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Hello ${name},</h2>
      <p>Thank you for choosing Policy Advisor. Your insurance consultation has been scheduled.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Advisor</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${advisorName}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Date</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${date}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Time</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${timeSlot}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Meeting Mode</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${type}</td>
        </tr>
      </table>
      <p>We look forward to helping you shape your financial safety net. If you need to make changes, please contact us at <strong>9825429228</strong>.</p>
      <p>Best regards,<br/><strong>Policy Advisor Team</strong></p>
    </div>
  `;
  return sendMail(email, subject, html);
};

export const sendAppointmentStatusUpdate = async (
  email: string,
  name: string,
  date: string,
  timeSlot: string,
  status: string
) => {
  const subject = `Consultation Status Update - Policy Advisor`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Hello ${name},</h2>
      <p>Your insurance consultation request on <strong>${date}</strong> at <strong>${timeSlot}</strong> has been updated.</p>
      <p>New Status: <strong style="text-transform: uppercase; color: ${status === 'APPROVED' ? '#16a34a' : status === 'CANCELLED' ? '#dc2626' : '#2563eb'};">${status}</strong></p>
      <p>If you have any questions, please call us at <strong>9825429228</strong>.</p>
      <p>Best regards,<br/><strong>Policy Advisor Team</strong></p>
    </div>
  `;
  return sendMail(email, subject, html);
};

export const sendQuoteConfirmation = async (email: string, name: string, insuranceType: string) => {
  const subject = `Quote Request Received - Policy Advisor`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Hello ${name},</h2>
      <p>We have successfully received your request for a <strong>${insuranceType}</strong> quote.</p>
      <p>An advisor is currently reviewing your details and will get in touch with premium illustrations shortly.</p>
      <p>Contact us at <strong>9825429228</strong> or reply directly to this email if you need urgent support.</p>
      <p>Best regards,<br/><strong>Policy Advisor Team</strong></p>
    </div>
  `;
  return sendMail(email, subject, html);
};

export const sendRegistrationConfirmation = async (email: string, name: string) => {
  const subject = `Welcome to Policy Advisor!`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Welcome ${name},</h2>
      <p>Thank you for registering an account with <strong>Policy Advisor</strong>.</p>
      <p>You can now log in to access your customer dashboard, calculate premium loads, view advisor recommendations, and manage your booked consultations.</p>
      <p>If you have any questions or would like to schedule a direct session, feel free to call us at <strong>9825429228</strong>.</p>
      <p>Best regards,<br/><strong>Dimple Shah & Bharat Shah</strong><br/>Policy Advisor Team</p>
    </div>
  `;
  return sendMail(email, subject, html);
};

export const sendAdvisorNotification = async (subject: string, html: string) => {
  const finalHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; border-top: 4px solid #0ea0eb;">
      <h2 style="color: #0c486e; font-family: 'Outfit', sans-serif;">Advisor Portal Notification</h2>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; rounded-lg: 8px;">
        ${html}
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
        This is an automated operational system alert dispatched from Policy Advisor CRM console.
      </p>
    </div>
  `;
  
  // Dispatch alerts to both advisors
  await sendMail('dimple_shah@yahoo.in', subject, finalHtml);
  await sendMail('bharatshah_1969@yahoo.in', subject, finalHtml);
};

export const sendSubscriptionNotification = async (subscriberEmail: string) => {
  const subject = `New Newsletter Subscription - Policy Advisor`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; border-top: 4px solid #0ea0eb;">
      <h2 style="color: #0c486e; font-family: 'Outfit', sans-serif;">New Subscriber Notification</h2>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
        <p>Dear Bharat Shah,</p>
        <p>This personal/client has subscribed to your newsletter:</p>
        <p style="font-size: 16px; font-weight: bold; color: #2563eb;">${subscriberEmail}</p>
        <p>You have a new subscriber!</p>
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
        This is an automated operational system alert dispatched from Policy Advisor.
      </p>
    </div>
  `;
  // Send email to Bharat Shah as requested
  await sendMail('bharatshah_1969@yahoo.in', subject, html);
};

export const sendSpecificAdvisorNotification = async (advisorEmail: string, advisorName: string, subject: string, html: string) => {
  const finalHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; border-top: 4px solid #0ea0eb;">
      <h2 style="color: #0c486e; font-family: 'Outfit', sans-serif;">Advisor Portal Notification</h2>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
        <p>Dear ${advisorName},</p>
        ${html}
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
        This is an automated operational system alert dispatched from Policy Advisor CRM console.
      </p>
    </div>
  `;
  await sendMail(advisorEmail, subject, finalHtml);
};
