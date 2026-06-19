const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send claim submitted notification to item owner
 */
const sendClaimSubmittedEmail = async ({ ownerEmail, ownerName, itemTitle, claimantName }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: ownerEmail,
      subject: `New Claim on Your Item: ${itemTitle}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; font-size: 28px;">🔍 FindIt</h1>
            <p style="color: #94a3b8; font-size: 14px;">Campus Lost & Found Portal</p>
          </div>
          <h2 style="color: #f1f5f9;">Hi ${ownerName},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            <strong style="color: #f1f5f9;">${claimantName}</strong> has submitted a claim on your item:
          </p>
          <div style="background: #1e293b; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #f1f5f9; font-size: 18px; font-weight: bold; margin: 0;">${itemTitle}</p>
          </div>
          <p style="color: #94a3b8;">Login to your FindIt dashboard to review the claim and proof of ownership.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Review Claim →
          </a>
          <hr style="border-color: #334155; margin: 32px 0;" />
          <p style="color: #475569; font-size: 12px;">FindIt Campus Portal — Reuniting lost items with their owners.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Email send error (claim submitted):', error.message);
  }
};

/**
 * Send claim approved email to claimant
 */
const sendClaimApprovedEmail = async ({ claimantEmail, claimantName, itemTitle, ownerName }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: claimantEmail,
      subject: `✅ Claim Approved: ${itemTitle}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; font-size: 28px;">🔍 FindIt</h1>
          </div>
          <h2 style="color: #22c55e;">🎉 Your claim has been approved!</h2>
          <p style="color: #94a3b8;">Hi ${claimantName},</p>
          <p style="color: #94a3b8; line-height: 1.6;">
            Great news! <strong style="color: #f1f5f9;">${ownerName}</strong> has approved your claim for:
          </p>
          <div style="background: #1e293b; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #f1f5f9; font-size: 18px; font-weight: bold; margin: 0;">${itemTitle}</p>
          </div>
          <p style="color: #94a3b8;">Please contact the item owner to arrange pickup. Your QR verification code has been sent to your dashboard.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            View Dashboard →
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Email send error (claim approved):', error.message);
  }
};

/**
 * Send claim rejected email to claimant
 */
const sendClaimRejectedEmail = async ({ claimantEmail, claimantName, itemTitle, reason }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: claimantEmail,
      subject: `❌ Claim Rejected: ${itemTitle}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; font-size: 28px;">🔍 FindIt</h1>
          </div>
          <h2 style="color: #ef4444;">Claim Not Approved</h2>
          <p style="color: #94a3b8;">Hi ${claimantName}, your claim for <strong style="color: #f1f5f9;">${itemTitle}</strong> was not approved.</p>
          ${reason ? `<p style="color: #94a3b8;">Reason: ${reason}</p>` : ''}
          <p style="color: #94a3b8;">If you believe this is an error, please contact the item owner through the portal.</p>
          <a href="${process.env.CLIENT_URL}/browse" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Browse Items →
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Email send error (claim rejected):', error.message);
  }
};

module.exports = { sendClaimSubmittedEmail, sendClaimApprovedEmail, sendClaimRejectedEmail };
