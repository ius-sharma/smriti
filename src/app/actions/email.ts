"use server";

import { Resend } from "resend";

// Initialize Resend dynamically to fetch environment values safely on invocation
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_your_api_key_here") {
    console.warn("RESEND_API_KEY is not configured. Falling back to client-side mailto method.");
    return null;
  }
  return new Resend(apiKey);
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

    const { data, error } = await resend.emails.send({
      from: "Smriti Tribute Wall <onboarding@resend.dev>", // Note: Free tier Resend accounts can only send to their registered email domain or onboarding@resend.dev
      to: teacherEmail,
      subject: `A Tribute Note from ${senderName} (via Smriti)`,
      replyTo: senderEmail,
      html: htmlContent
    });

    if (error) {
      console.error("Resend API returned error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
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
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "API_KEY_MISSING" };
    }

    const htmlContent = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #fffdf5; padding: 40px 20px; color: #1c150c;">
        <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fef08a; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(180,83,9,0.05);">
          <h2 style="font-size: 24px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fefce8; padding-bottom: 16px; margin-top: 0;">
            Blessings & Message Received
          </h2>
          <p style="font-size: 15px; line-height: 1.6; color: #451a03;">
            Hello,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #451a03;">
            Your teacher <strong>${teacherName}</strong> (${designation} of ${subject} at ${college}) has left their blessings for you:
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #78350f; font-style: italic; background-color: #fffdf2; border-left: 3px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            &ldquo;${blessingsText}&rdquo;
          </p>
          <p style="font-size: 13px; color: #92400e; margin-top: 24px;">
            Teacher's Contact Email: <strong>${teacherEmail}</strong>
          </p>
          <div style="margin-top: 32px; border-t: 1px solid #fffdf5; padding-top: 16px; font-size: 11px; text-align: center; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">
            Smriti &copy; 2026 | Dedicated to Honoring Mentorship
          </div>
        </div>
      </div>
    `;

    const destinationEmail = studentEmail || "sharmaeditzayush@gmail.com";

    const { data, error } = await resend.emails.send({
      from: "Smriti Blessings <onboarding@resend.dev>",
      to: destinationEmail, // Direct blessings delivery target
      subject: `Tribute blessings from ${teacherName} (Smriti)`,
      replyTo: teacherEmail,
      html: htmlContent
    });

    if (error) {
      console.error("Resend API returned error for blessings:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
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

    const { data, error } = await resend.emails.send({
      from: "Smriti Tribute Wall <onboarding@resend.dev>",
      to: email,
      subject: `Credentials for your Tribute Wall "${wallTitle}"`,
      html: htmlContent
    });

    if (error) {
      console.error("Resend API returned error for credentials email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action sendWallCredentialsEmail caught error:", err);
    return { success: false, error: err?.message || "Internal Server Error" };
  }
}
