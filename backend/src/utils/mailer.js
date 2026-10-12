const nodemailer = require('nodemailer');

// Initialize transporter with environment SMTP credentials or fallback to test/console logging
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`[Mailer] Configured SMTP Transport via ${host}:${port} (${user})`);
  } else {
    // Development / Local fallback transporter
    transporter = nodemailer.createTransport({
      jsonTransport: true // Logs message envelope & body in JSON, preventing network hangs
    });
    console.log('[Mailer] No external SMTP configured; using local JSON delivery logger.');
  }

  return transporter;
};

/**
 * 1. Send Inquiry Notification Email directly to the Agent's configured email
 */
exports.sendNewInquiryAlertToAgent = async ({
  agentEmail,
  agentName = 'Agent',
  customerName,
  customerEmail,
  customerPhone,
  propertyTitle,
  propertyRef,
  message,
  preferredTime,
  enquiryType = 'enquiry'
}) => {
  try {
    const transport = await getTransporter();
    const recipient = agentEmail || 'saranyasoman31@gmail.com';
    const fromAddress = process.env.SMTP_FROM || `"DARV Real Estate & Construction" <notifications@darvproperties.com>`;

    const mailOptions = {
      from: fromAddress,
      to: recipient,
      replyTo: customerEmail,
      subject: `🚨 [New ${enquiryType === 'site_visit' ? 'Site Visit Request' : 'Customer Lead'}] ${customerName} - ${propertyTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%); padding: 24px 32px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Apex Realty & Developers</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85;">New Customer Inquiry Received</p>
          </div>
          <div style="padding: 32px 32px 24px 32px;">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">Hello <strong>${agentName}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              A potential client has submitted an inquiry on your marketplace listing for <strong>"${propertyTitle}"</strong> (Ref: <code>${propertyRef}</code>).
            </p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Customer Contact Details</h3>
              <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none;">${customerEmail}</a></p>
              <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #0284c7; text-decoration: none;">${customerPhone}</a></p>
              ${preferredTime ? `<p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>Preferred Visit Time:</strong> ${preferredTime}</p>` : ''}
              <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                <strong style="font-size: 13px; color: #475569;">Message:</strong>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #0f172a; font-style: italic; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">"${message}"</p>
              </div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:5173/admin/inquiries" style="display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px;">Open Inquiries CRM Console</a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 16px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
            This email was automatically sent to the agent notification email configured in your profile (${recipient}).
          </div>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[Mailer] Direct Inquiry Alert pushed to Agent (${recipient}): Message ID ${info.messageId || 'Local'}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer] Error pushing email alert to agent:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 2. Push Email Reply / Update from Agent to Customer
 */
exports.sendEmailPushToCustomer = async ({
  agentEmail,
  agentName = 'Saranya Soman',
  agentPhone = '+91 98470 12345',
  agentWhatsapp = '+919847012345',
  agentWebsite = 'https://www.darvproperties.com',
  agentAddress = 'DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003',
  customerEmail,
  customerName,
  propertyTitle,
  subject,
  message
}) => {
  try {
    const transport = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"${agentName} | DARV Real Estate" <${agentEmail || 'saranyasoman31@gmail.com'}>`;

    const mailOptions = {
      from: fromAddress,
      to: customerEmail,
      replyTo: agentEmail || 'saranyasoman31@gmail.com',
      subject: subject || `Regarding your property enquiry for "${propertyTitle}" - DARV Real Estate`,
      html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0b1b38 0%, #153c72 100%); padding: 24px 32px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">DARV Real Estate & Construction</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #d4af37;">Dreams Architecture Realty Value • Trivandrum, Kerala</p>
          </div>
          <div style="padding: 32px 32px 24px 32px;">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
            <div style="font-size: 14px; color: #1e293b; line-height: 1.7; white-space: pre-line; margin: 16px 0; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              ${message}
            </div>

            <div style="margin: 24px 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Your Direct Property Advisor</h4>
              <p style="margin: 4px 0; font-size: 15px; font-weight: 700; color: #0f172a;">${agentName}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #475569;">📞 Phone: <a href="tel:${agentPhone}" style="color: #0284c7; text-decoration: none;">${agentPhone}</a></p>
              <p style="margin: 4px 0; font-size: 13px; color: #475569;">💬 WhatsApp: <a href="https://wa.me/${agentWhatsapp.replace(/[^0-9]/g, '')}" style="color: #10b981; text-decoration: none;">Chat on WhatsApp</a></p>
              <p style="margin: 4px 0; font-size: 13px; color: #475569;">✉️ Email: <a href="mailto:${agentEmail}" style="color: #0284c7; text-decoration: none;">${agentEmail}</a></p>
              ${agentWebsite ? `<p style="margin: 4px 0; font-size: 13px; color: #475569;">🌐 Website: <a href="${agentWebsite}" target="_blank" style="color: #0284c7; text-decoration: none;">${agentWebsite}</a></p>` : ''}
              <p style="margin: 4px 0; font-size: 13px; color: #475569;">📍 Office Address: ${agentAddress}</p>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 16px 32px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
            This email was sent by ${agentName} via Apex Realty Single Client Portal. You can reply directly to this email.
          </div>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[Mailer] Email pushed to Customer (${customerEmail}): Message ID ${info.messageId || 'Local'}`);
    return { success: true, messageId: info.messageId || 'sent-local' };
  } catch (error) {
    console.error('[Mailer] Error pushing email to customer:', error);
    return { success: false, error: error.message };
  }
};
