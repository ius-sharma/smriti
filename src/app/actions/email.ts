"use server";

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { INITIAL_TEACHERS } from "../data";

// Initialize Gmail SMTP Transporter with environment values and fallback
function getMailTransporter() {
  const user = process.env.SMTP_USER || "sharmaeditzayush@gmail.com";
  const pass = process.env.SMTP_PASS || "mvyltvyomeapzzty";
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

// Initialize Resend dynamically to fetch environment values safely on invocation
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_your_api_key_here") {
    console.warn("RESEND_API_KEY is not configured.");
    return null;
  }
  return new Resend(apiKey);
}

interface UnifiedMailParams {
  from?: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendUnifiedEmail({ from, to, replyTo, subject, html, text }: UnifiedMailParams) {
  // 1. Prioritize authenticated Gmail SMTP (Zero restrictions, delivers to all university & personal domains)
  const transporter = getMailTransporter();
  if (transporter) {
    const smtpUser = process.env.SMTP_USER || "sharmaeditzayush@gmail.com";
    const sender = from || `"Ayush Sharma" <${smtpUser}>`;
    try {
      const plainText = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const info = await transporter.sendMail({
        from: sender,
        to,
        replyTo: replyTo || smtpUser,
        subject,
        text: plainText,
        html
      });
      return { success: true, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error("Gmail SMTP error:", smtpErr);
      return { success: false, error: smtpErr?.message || "Gmail SMTP delivery failed" };
    }
  }

  // 2. Fallback to Resend (Requires onboarding@resend.dev unless custom domain verified)
  const resend = getResendClient();
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: "Smriti Tribute Wall <onboarding@resend.dev>",
        to,
        replyTo: replyTo || "sharmaeditzayush@gmail.com",
        subject,
        html
      });
      if (error) return { success: false, error: error.message };
      return { success: true, messageId: data?.id };
    } catch (resendErr: any) {
      return { success: false, error: resendErr?.message || "Resend dispatch error" };
    }
  }

  return { success: false, error: "NO_MAIL_TRANSPORT_CONFIGURED" };
}

interface ThankYouEmailParams {
  teacherName: string;
  teacherEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

interface BlessingsEmailParams {
  teacherName: string;
  teacherEmail: string;
  designation: string;
  subject: string;
  college: string;
  blessingsText: string;
  studentEmail?: string;
}

/**
 * Sends a Thank You message from a student to a teacher's email.
 */
export async function sendThankYouEmail({
  teacherName,
  teacherEmail,
  senderName,
  senderEmail,
  message
}: ThankYouEmailParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "API_KEY_MISSING" };
    }

    const htmlContent = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #fffdf5; padding: 40px 20px; color: #1c150c;">
        <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fef08a; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(180,83,9,0.05);">
          <h2 style="font-size: 24px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fefce8; padding-bottom: 16px; margin-top: 0;">
            A Note of Appreciation
          </h2>
          <p style="font-size: 16px; line-height: 1.6; color: #451a03;">
            Dear <strong>${teacherName}</strong>,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #78350f; font-style: italic; background-color: #fffdf2; border-left: 3px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            &ldquo;${message}&rdquo;
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #78350f; margin-top: 24px;">
            With sincere gratitude,<br />
            <strong>${senderName}</strong><br />
            <span style="font-size: 12px; color: #92400e;">(${senderEmail})</span>
          </p>
          <div style="margin-top: 32px; border-t: 1px solid #fffdf5; padding-top: 16px; font-size: 11px; text-align: center; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">
            Sent via Smriti &copy; 2026 | A Sanctuary of Gratitude
          </div>
        </div>
      </div>
    `;

    const result = await sendUnifiedEmail({
      to: teacherEmail,
      subject: `A Tribute Note from ${senderName} (via Smriti)`,
      replyTo: senderEmail,
      html: htmlContent
    });

    if (!result.success) {
      console.error("sendThankYouEmail error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: { id: result.messageId } };
  } catch (err: any) {
    console.error("Server Action sendThankYouEmail caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

/**
 * Sends a blessings/reply message from a teacher directly to the student's email inbox.
 */
export async function sendBlessingsEmail({
  teacherName,
  teacherEmail,
  designation,
  subject,
  college,
  blessingsText,
  studentEmail
}: BlessingsEmailParams) {
  try {
    const htmlContent = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #fffdf5; padding: 40px 20px; color: #1c150c;">
        <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fef08a; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(180,83,9,0.05);">
          <h2 style="font-size: 24px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fefce8; padding-bottom: 16px; margin-top: 0;">
            Blessings & Words of Encouragement
          </h2>
          <p style="font-size: 16px; line-height: 1.6; color: #451a03;">
            Dear Student,
          </p>
          <div style="font-size: 15px; line-height: 1.7; color: #78350f; font-style: italic; background-color: #fffdf2; border-left: 3px solid #f59e0b; padding: 18px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            &ldquo;${blessingsText}&rdquo;
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #78350f; margin-top: 24px;">
            With blessings and best wishes,<br />
            <strong>${teacherName}</strong><br />
            <span style="font-size: 12px; color: #92400e;">${designation}, ${subject}</span><br />
            <span style="font-size: 12px; color: #b45309;">${college}</span>
          </p>
          <div style="margin-top: 32px; border-t: 1px solid #fffdf5; padding-top: 16px; font-size: 11px; text-align: center; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">
            Smriti &copy; 2026 | Dedicated to Honoring Mentorship
          </div>
        </div>
      </div>
    `;

    const destinationEmail = studentEmail || "sharmaeditzayush@gmail.com";

    const result = await sendUnifiedEmail({
      to: destinationEmail,
      subject: `Tribute blessings from ${teacherName} (Smriti)`,
      replyTo: teacherEmail,
      html: htmlContent
    });

    if (!result.success) {
      console.error("sendBlessingsEmail error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: { id: result.messageId } };
  } catch (err: any) {
    console.error("Server Action sendBlessingsEmail caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

interface FestivalReminderParams {
  name: string;
  email: string;
  festivalName: string;
  festivalDate: string;
  daysBefore: number;
  isConfirmation?: boolean;
}

/**
 * Sends a festival reminder or scheduling confirmation email to a user.
 */
export async function sendFestivalReminderEmail({
  name,
  email,
  festivalName,
  festivalDate,
  daysBefore,
  isConfirmation = false
}: FestivalReminderParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "API_KEY_MISSING" };
    }

    const readableDate = new Date(festivalDate).toLocaleDateString('en-IN', {
      dateStyle: 'long',
      timeZone: 'Asia/Kolkata'
    });

    let subject = "";
    let htmlContent = "";

    if (isConfirmation) {
      subject = `Reminder Scheduled: ${festivalName} (via Smriti)`;
      htmlContent = `
        <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #fffdf5; padding: 40px 20px; color: #1c150c;">
          <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fde047; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(180,83,9,0.05);">
            <h2 style="font-size: 24px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fefce8; padding-bottom: 16px; margin-top: 0; text-align: center;">
              Reminder Successfully Set!
            </h2>
            <p style="font-size: 16px; line-height: 1.6; color: #451a03;">
              Namaste <strong>${name}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #451a03;">
              You have successfully scheduled an email reminder for the upcoming auspicious festival:
            </p>
            <div style="background-color: #fffdf2; border-left: 3px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 8px 0; color: #78350f; font-size: 18px;">${festivalName}</h3>
              <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                Festival Date: <strong>${readableDate}</strong>
                <br/>
                Trigger: <strong>${daysBefore === 0 ? "On the same day" : `${daysBefore} day(s) before`}</strong>
              </p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #78350f;">
              We will send you a reminder email when the trigger time arrives.
            </p>
            <div style="margin-top: 32px; border-top: 1px solid #fffdf5; padding-top: 16px; font-size: 11px; text-align: center; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">
              Smriti &copy; 2026 | Celebrating Culture & Mentorship
            </div>
          </div>
        </div>
      `;
    } else {
      subject = `Reminder: ${festivalName} is in ${daysBefore === 0 ? "today" : `${daysBefore} day(s)`}! 🙏`;
      htmlContent = `
        <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #fffdf5; padding: 40px 20px; color: #1c150c;">
          <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fde047; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(180,83,9,0.05);">
            <h2 style="font-size: 24px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fefce8; padding-bottom: 16px; margin-top: 0; text-align: center;">
              Auspicious Celebration Reminder
            </h2>
            <p style="font-size: 16px; line-height: 1.6; color: #451a03;">
              Namaste <strong>${name}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #451a03;">
              This is your friendly reminder that the festival is fast approaching:
            </p>
            <div style="background-color: #fffdf2; border-left: 3px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 8px 0; color: #78350f; font-size: 18px;">${festivalName}</h3>
              <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                Festival Date: <strong>${readableDate}</strong>
                <br/>
                Status: <strong>${daysBefore === 0 ? "Happening today!" : `Approaching in ${daysBefore} day(s)`}</strong>
              </p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #78350f;">
              Wishing you a joyous and blessed celebration!
            </p>
            <div style="margin-top: 32px; border-top: 1px solid #fffdf5; padding-top: 16px; font-size: 11px; text-align: center; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">
              Smriti &copy; 2026 | Celebrating Culture & Mentorship
            </div>
          </div>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "Smriti Festival Reminder <onboarding@resend.dev>",
      to: email,
      subject: subject,
      html: htmlContent
    });

    if (error) {
      console.error("Resend API returned error for festival reminder:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action sendFestivalReminderEmail caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

interface WallCredentialsParams {
  email: string;
  creatorName: string;
  wallTitle: string;
  wallLink: string;
  editKey: string;
}

/**
 * Sends wall link and edit key credentials to the creator's email.
 */
export async function sendWallCredentialsEmail({
  email,
  creatorName,
  wallTitle,
  wallLink,
  editKey
}: WallCredentialsParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "API_KEY_MISSING" };
    }

    const htmlContent = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #fffdf5; padding: 40px 20px; color: #1c150c;">
        <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fde047; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(180,83,9,0.05);">
          <h2 style="font-size: 22px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fefce8; padding-bottom: 16px; margin-top: 0; text-align: center;">
            Your Smriti Tribute Wall Keys 🔑
          </h2>
          <p style="font-size: 15px; line-height: 1.6; color: #451a03;">
            Pranam <strong>${creatorName}</strong>,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #451a03;">
            Here are the access links and secret edit credentials for your newly created tribute wall: <strong>"${wallTitle}"</strong>.
          </p>
          <div style="background-color: #fffdf2; border-left: 3px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-family: monospace;">
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #92400e;">
              <strong>Wall Link:</strong> <a href="${wallLink}" style="color: #b45309; text-decoration: underline;">${wallLink}</a>
            </p>
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>Secret Edit Key:</strong> <span style="font-size: 15px; font-weight: bold; color: #78350f;">${editKey}</span>
            </p>
          </div>
          <p style="font-size: 13px; line-height: 1.6; color: #78350f; background-color: #fffbeb; padding: 12px; border-radius: 8px;">
            <strong>⚠️ IMPORTANT SAFETY NOTE:</strong> Keep this email safe! You will need this secret Edit Key to unlock edit and delete controls in the future (especially if you access from a different browser or device).
          </p>
          <div style="margin-top: 32px; border-top: 1px solid #fffdf5; padding-top: 16px; font-size: 11px; text-align: center; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">
            Smriti &copy; 2026 | Dedicated to Honoring Mentorship
          </div>
        </div>
      </div>
    `;

    const result = await sendUnifiedEmail({
      to: email,
      subject: `Credentials for your Tribute Wall "${wallTitle}"`,
      html: htmlContent
    });

    if (!result.success) {
      console.error("sendWallCredentialsEmail error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: { id: result.messageId } };
  } catch (err: any) {
    console.error("Server Action sendWallCredentialsEmail caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}

interface JanmashtamiNudgeParams {
  recipientName: string;
  recipientEmail: string;
  ctaUrl?: string;
}

/**
 * Sends an inspirational Janmashtami nudge email celebrating Guru-Shishya Parampara with a CTA.
 */
export async function sendJanmashtamiNudgeEmail({
  recipientName,
  recipientEmail,
  ctaUrl = "https://smriti-tribute.vercel.app"
}: JanmashtamiNudgeParams) {
  try {
    const htmlContent = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #030712; padding: 40px 20px; color: #fefce8;">
        <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 18px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; font-size: 38px; margin-bottom: 8px;">🪈✨</div>
            <h1 style="font-size: 26px; font-weight: bold; color: #fbbf24; margin: 0; letter-spacing: 0.02em;">
              Guru-Shishya Parampara
            </h1>
            <p style="color: #cbd5e1; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">
              Shri Krishna Janmashtami 2026 Special
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #f1f5f9;">
            Pranam <strong>${recipientName}</strong>,
          </p>
          
          <p style="font-size: 15px; line-height: 1.7; color: #e2e8f0; font-style: italic; background: rgba(30, 41, 59, 0.7); border-left: 3px solid #d97706; padding: 18px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            &ldquo;Just as Shri Krishna illuminated Arjuna's path with timeless wisdom on the battlefield of Kurukshetra, our teachers illuminate our minds and shape our character in the journey of life.&rdquo;
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            On this auspicious occasion of Janmashtami, take a sacred moment to send your heartfelt appreciation to the mentor who guided you.
          </p>

          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(217,119,6,0.4); text-transform: uppercase; letter-spacing: 0.05em;">
              Write a Note to Your Guru &rarr;
            </a>
          </div>

          <div style="margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; font-size: 11px; text-align: center; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
            Smriti &copy; 2026 | In honor of our respected teachers
          </div>
        </div>
      </div>
    `;

    const result = await sendUnifiedEmail({
      to: recipientEmail,
      subject: "Happy Janmashtami! Take a moment to thank your Guru.",
      html: htmlContent
    });

    if (!result.success) {
      console.error("sendJanmashtamiNudgeEmail error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: { id: result.messageId } };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Server Action sendJanmashtamiNudgeEmail caught error:", err);
    return { success: false, error: errorMsg };
  }
}

export interface JanmashtamiBatchParams {
  target: "test_only" | "all_teachers";
  testTeacherId?: string;
  testEmailOverride?: string;
  senderName?: string;
  senderEmail?: string;
  customMessage?: string;
  baseUrl?: string;
}

export interface DispatchResultItem {
  teacherId: string;
  teacherName: string;
  recipientEmail: string;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Server Action: Dispatches Janmashtami Guru-Shishya gratitude emails in batch or targeted test mode.
 */
export async function dispatchJanmashtamiBatch({
  target = "test_only",
  testTeacherId,
  testEmailOverride,
  senderName = "Ayush Sharma",
  senderEmail = "sharmaeditzayush@gmail.com",
  customMessage,
  baseUrl
}: JanmashtamiBatchParams): Promise<{
  success: boolean;
  totalTargeted: number;
  totalSent: number;
  results: DispatchResultItem[];
  error?: string;
}> {
  try {
    const effectiveBaseUrl = (baseUrl?.trim() || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

    // Determine target teachers
    let teachersToSend = INITIAL_TEACHERS;
    if (target === "test_only") {
      // Find specified teacher (or Dr. Arvind by default)
      const targetId = testTeacherId || "7";
      const testTeacher = INITIAL_TEACHERS.find(t => t.id === targetId) || INITIAL_TEACHERS[0];
      teachersToSend = [testTeacher];
    }

    const results: DispatchResultItem[] = [];
    let sentCount = 0;

    for (const teacher of teachersToSend) {
      // If user provided a testEmailOverride and it's a test run, use the override email
      const recipientEmail = (target === "test_only" && testEmailOverride?.trim()) 
        ? testEmailOverride.trim() 
        : (teacher.contactEmail || "sharmaeditzayush@gmail.com");

      const tName = teacher.salutation || teacher.name;
      const personalizedMessage = customMessage?.trim() || 
        `On this auspicious festival of Shri Krishna Janmashtami, I reflect with profound gratitude on the eternal Guru-Shishya Parampara. Just as Shri Krishna illuminated Arjuna's path with divine wisdom, your guidance, patience, and mentorship have illuminated my academic journey. Wishing you and your family abundant peace, health, and blessings on Janmashtami.`;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Shubh Janmashtami</title>
        </head>
        <body style="margin: 0; padding: 20px 12px; background-color: #faf9f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d261e;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e2d5; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            
            <!-- Krishna Peacock & Gold Header Bar -->
            <div style="background: linear-gradient(135deg, #091322 0%, #1e3a5f 100%); padding: 22px 20px; text-align: center; border-bottom: 2px solid #d4af37;">
              <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.12em; color: #fde047; text-transform: uppercase;">
                Shri Krishna Janmashtami • 2026
              </div>
            </div>

            <!-- Letter Body -->
            <div style="padding: 26px 24px 22px 24px;">
              <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #1c150c; font-weight: 600;">
                Respected ${tName},
              </h2>

              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #3d352a;">
                ${personalizedMessage}
              </p>

              ${teacher.gitaLesson ? `
                <div style="background-color: #fefdf8; border-left: 3px solid #b45309; border-top: 1px solid #fef3c7; border-right: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 18px 0;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #92400e; margin-bottom: 4px;">
                    Krishnam Vande Jagadgurum • Sacred Wisdom
                  </div>
                  <div style="font-family: Georgia, serif; font-size: 13px; color: #78350f; font-style: italic; line-height: 1.5;">
                    &ldquo;${teacher.gitaLesson}&rdquo;
                  </div>
                </div>
              ` : ''}

              <!-- Student Sign-off -->
              <div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #f1ece1;">
                <p style="margin: 0; font-size: 13px; color: #78716c;">
                  With sincere gratitude and pranam,
                </p>
                <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #1c150c;">
                  ${senderName}
                </p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #a8a29e;">
                  Student • Smriti Tribute Sanctuary
                </p>
              </div>

              <!-- Interactive Tribute & Blessings Link -->
              <div style="margin-top: 20px; padding-top: 14px; border-top: 1px dashed #e8e2d5; text-align: center;">
                <a href="${effectiveBaseUrl}/janmashtami?id=${teacher.id}" style="font-family: Georgia, serif; font-size: 13px; color: #b45309; text-decoration: underline; font-style: italic;">
                  View your interactive Janmashtami card &amp; send blessings &rarr;
                </a>
              </div>
            </div>

            <!-- Minimal Footer -->
            <div style="background-color: #faf8f5; padding: 12px 24px; border-top: 1px solid #e8e2d5; font-size: 11px; color: #a8a29e; text-align: center;">
              Dedicated with reverence to the mentors of Marwadi University &copy; 2026
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Shri Krishna Janmashtami • 2026

Respected ${tName},

${personalizedMessage}

${teacher.gitaLesson ? `Krishnam Vande Jagadgurum • Sacred Wisdom:\n"${teacher.gitaLesson}"\n` : ''}
With sincere gratitude and pranam,
${senderName}
Student • Smriti Tribute Sanctuary

View your interactive tribute card & send your blessings:
${effectiveBaseUrl}/janmashtami?id=${teacher.id}
      `.trim();

      try {
        const mailResult = await sendUnifiedEmail({
          from: `"Ayush Sharma" <${process.env.SMTP_USER || "sharmaeditzayush@gmail.com"}>`,
          to: recipientEmail,
          subject: `Shubh Janmashtami, ${tName} — Guru-Shishya Gratitude`,
          replyTo: senderEmail,
          text: textContent,
          html: htmlContent
        });

        if (!mailResult.success) {
          console.error(`Error sending email to ${teacher.name} (${recipientEmail}):`, mailResult.error);
          results.push({
            teacherId: teacher.id,
            teacherName: teacher.name,
            recipientEmail,
            success: false,
            error: mailResult.error,
            timestamp: new Date().toISOString()
          });
        } else {
          sentCount++;
          results.push({
            teacherId: teacher.id,
            teacherName: teacher.name,
            recipientEmail,
            success: true,
            messageId: mailResult.messageId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (sendErr: unknown) {
        const msg = sendErr instanceof Error ? sendErr.message : "Dispatch error";
        results.push({
          teacherId: teacher.id,
          teacherName: teacher.name,
          recipientEmail,
          success: false,
          error: msg,
          timestamp: new Date().toISOString()
        });
      }
    }

    return {
      success: sentCount > 0,
      totalTargeted: teachersToSend.length,
      totalSent: sentCount,
      results
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("dispatchJanmashtamiBatch error:", err);
    return {
      success: false,
      totalTargeted: 0,
      totalSent: 0,
      results: [],
      error: errorMsg
    };
  }
}


