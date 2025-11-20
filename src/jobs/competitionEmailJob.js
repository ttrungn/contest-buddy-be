import cron from "node-cron";
import db from "../models/index.js";
import Competitions, {
  COMPETITION_STATUSES,
  COMPETITION_PAYING_STATUSES,
} from "../models/competitions.js";
import CompetitionTags from "../models/competitionTags.js";
import CompetitionRequiredSkills from "../models/competitionRequiredSkills.js";
import { sendMail, isEmailEnabled } from "../services/mailerService.js";

/**
 * Get top 5 competitions with highest price plans that have registration deadline >= current time
 */
const getTopCompetitionsForEmail = async () => {
  try {
    const currentDate = new Date();

    // First, get all active plans sorted by price
    if (!db.Plans) {
      throw new Error("Plans model not available");
    }

    const allPlans = await db.Plans.find({ status: "active" })
      .sort({ price_amount: -1 })
      .select("id name price_amount currency");

    if (!allPlans || allPlans.length === 0) {
      console.log("No active plans found");
      return [];
    }

    // Get all plan IDs
    const planIds = allPlans.map((plan) => plan.id);

    // Find competitions that:
    // 1. Have one of the plans
    // 2. Registration deadline is >= current time (still open for registration)
    // 3. Not deleted
    // 4. Payment status is "Đã thanh toán" (paid)
    // 5. Status is "Đang mở đăng ký" (registration open)
    const competitions = await Competitions.find({
      plan_id: { $in: planIds },
      registration_deadline: { $gte: currentDate },
      isDeleted: false,
      status: { $in: [COMPETITION_STATUSES.REGISTRATION_OPEN] },
      paying_status: COMPETITION_PAYING_STATUSES.PAID,
    });

    if (!competitions || competitions.length === 0) {
      console.log("No eligible competitions found");
      return [];
    }

    // Populate plan data and calculate plan price for each competition
    const competitionsWithDetails = await Promise.all(
      competitions.map(async (competition) => {
        const competitionObj = competition.toObject();

        // Get plan data
        let planData = null;
        if (competition.plan_id) {
          planData = await db.Plans.findOne(
            { id: competition.plan_id },
            { name: 1, price_amount: 1, currency: 1, status: 1 }
          );
        }

        // Get competition tags
        const competitionTags = await CompetitionTags.find(
          { competition_id: competition.id },
          { tag: 1, _id: 0 }
        );

        // Get competition required skills
        const competitionRequiredSkills = await CompetitionRequiredSkills.find(
          { competition_id: competition.id },
          { name: 1, category: 1, _id: 0 }
        );

        // Add all details
        if (planData) {
          competitionObj.plan = planData;
          competitionObj._planPrice = planData.price_amount || 0;
        } else {
          competitionObj._planPrice = 0;
        }

        competitionObj.competitionTags = competitionTags.map((tag) => tag.tag);
        competitionObj.competitionRequiredSkills = competitionRequiredSkills;

        return competitionObj;
      })
    );

    // Sort by plan price (highest first)
    competitionsWithDetails.sort((a, b) => b._planPrice - a._planPrice);

    // Get top 5 and randomize them
    let topCompetitions = competitionsWithDetails.slice(0, 5);

    // Fisher-Yates shuffle for random order
    for (let i = topCompetitions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topCompetitions[i], topCompetitions[j]] = [
        topCompetitions[j],
        topCompetitions[i],
      ];
    }

    // Clean up temporary fields
    topCompetitions.forEach((comp) => {
      delete comp._planPrice;
    });

    return topCompetitions;
  } catch (error) {
    console.error("Error getting top competitions:", error);
    return [];
  }
};

/**
 * Generate HTML email content for competition recommendations
 */
const generateCompetitionEmailHTML = (competitions) => {
  const competitionCards = competitions
    .map(
      (comp) => `
    <div style="margin-bottom: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #4CAF50;">
      <h3 style="margin: 0 0 10px 0; color: #333;">${comp.title}</h3>
      <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${comp.category}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Level:</strong> ${comp.level}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${comp.location || "Online"}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Registration Deadline:</strong> ${new Date(comp.registration_deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      ${comp.prize_pool_text ? `<p style="margin: 5px 0; color: #4CAF50;"><strong>Prize Pool:</strong> ${comp.prize_pool_text}</p>` : ""}
      ${comp.competitionTags && comp.competitionTags.length > 0 ? `<p style="margin: 10px 0 5px 0;"><strong>Tags:</strong> ${comp.competitionTags.map((tag) => `<span style="background: #e0e0e0; padding: 3px 8px; border-radius: 4px; margin-right: 5px; font-size: 12px;">${tag}</span>`).join("")}</p>` : ""}
      <p style="margin: 10px 0 0 0;">${comp.description.substring(0, 200)}${comp.description.length > 200 ? "..." : ""}</p>
      <div style="margin-top: 15px;">
        <a href="https://contest-buddy.online/competition/${comp.id}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details</a>
      </div>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Competition Recommendations</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🏆 Top Competition Recommendations</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Discover premium competitions with the highest prizes</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #555;">
          Hello! 👋
        </p>
        <p style="font-size: 16px; color: #555;">
          We've handpicked <strong>5 premium competitions</strong> for you this week. These competitions offer the highest prize pools and are currently open for registration!
        </p>
        
        <div style="margin: 30px 0;">
          ${competitionCards}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            Don't miss out on these amazing opportunities! Register now before the deadline.
          </p>
          <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">
            You're receiving this email because you're subscribed to our competition recommendations.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Get all users with verified email to send competition recommendations
 */
const getUsersForEmailNotification = async () => {
  try {
    if (!db.User) {
      throw new Error("User model not available");
    }

    // Get all verified users
    const users = await db.User.find(
      { is_verified: true },
      { id: 1, email: 1, full_name: 1, username: 1 }
    );

    return users;
  } catch (error) {
    console.error("Error getting users for email notification:", error);
    return [];
  }
};

/**
 * Send competition recommendation emails to all users
 */
const sendCompetitionEmails = async () => {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting competition email job...`
    );

    // Check if email is enabled
    if (!isEmailEnabled()) {
      console.log("Email is not configured. Skipping email job.");
      return;
    }

    // Get top 5 competitions
    const competitions = await getTopCompetitionsForEmail();

    if (competitions.length === 0) {
      console.log("No competitions found to send. Skipping email job.");
      return;
    }

    console.log(`Found ${competitions.length} competitions to recommend`);

    // Get all users
    const users = await getUsersForEmailNotification();

    if (users.length === 0) {
      console.log("No users found to send emails to. Skipping email job.");
      return;
    }

    console.log(`Sending emails to ${users.length} users...`);

    // Generate email HTML
    const emailHTML = generateCompetitionEmailHTML(competitions);
    const emailSubject = `🏆 Top ${competitions.length} Competition Recommendations - Don't Miss Out!`;

    // Send emails to all users
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await sendMail({
          to: user.email,
          subject: emailSubject,
          html: emailHTML,
          text: `Check out our top ${competitions.length} competition recommendations!`,
        });
        successCount++;
        console.log(`✓ Email sent to ${user.email}`);
      } catch (error) {
        failCount++;
        console.error(`✗ Failed to send email to ${user.email}:`, error.message);
      }
    }

    try {
    await sendMail({
        to: "entiti832004@gmail.com",
        subject: emailSubject,
        html: emailHTML,
        text: `Check out our top ${competitions.length} competition recommendations!`,
    });
    successCount++;
    console.log(`✓ Email sent to ${"entiti832004@gmail.com"}`);
    } catch (error) {
    failCount++;
    console.error(`✗ Failed to send email to ${"entiti832004@gmail.com"}:`, error.message);
    }

    console.log(
      `[${new Date().toISOString()}] Email job completed. Success: ${successCount}, Failed: ${failCount}`
    );
  } catch (error) {
    console.error("Error in competition email job:", error);
  }
};

/**
 * Schedule the job to run every Monday and Wednesday at 7:00 AM
 * Cron format: minute hour day-of-month month day-of-week
 * 0 7 * * 1,3 = At 7:00 AM on Monday and Wednesday
 */
export const startCompetitionEmailJob = () => {
  // Schedule for every Monday and Wednesday at 7:00 AM
  const job = cron.schedule(
    "0 7 * * 1,3",
    async () => {
      await sendCompetitionEmails();
    },
    {
      scheduled: true,
      timezone: process.env.TIMEZONE || "Asia/Ho_Chi_Minh", // Set your timezone
    }
  );

  console.log(
    "✓ Competition email job scheduled: Every Monday and Wednesday at 7:00 AM"
  );

  return job;
};

/**
 * Run the job immediately (for testing purposes)
 */
export const runCompetitionEmailJobNow = async () => {
  console.log("Running competition email job manually...");
  await sendCompetitionEmails();
};

export default {
  startCompetitionEmailJob,
  runCompetitionEmailJobNow,
  sendCompetitionEmails,
  getTopCompetitionsForEmail,
};
