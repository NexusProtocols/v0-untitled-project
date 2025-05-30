import nodemailer from "nodemailer"

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || ""
const EMAIL_PASS = process.env.EMAIL_PASS || ""
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com"
const EMAIL_PORT = Number.parseInt(process.env.EMAIL_PORT || "587")

// Create a transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

export async function sendVerificationEmail(to: string, code: string, username: string): Promise<boolean> {
  try {
    // Create email content
    const emailSubject = "NEXUS - Email Verification Code"
    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 4px solid #00c6ed; padding: 20px; border-radius: 5px;">
            <h1 style="color: #00ff9d;">NEXUS Email Verification</h1>
            <p>Hello ${username},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #050505; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; color: #00c6ed; font-weight: bold;">
              ${code}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              &copy; ${new Date().getFullYear()} NEXUS. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `

    // Send email
    const info = await transporter.sendMail({
      from: `"NEXUS Security" <${EMAIL_USER}>`,
      to: to,
      subject: emailSubject,
      html: emailBody,
    })

    console.log("Email sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
