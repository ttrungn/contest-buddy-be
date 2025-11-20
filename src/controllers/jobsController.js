import { runCompetitionEmailJobNow } from "../jobs/competitionEmailJob.js";

/**
 * Trigger competition email job manually (for testing)
 */
export const handleTriggerCompetitionEmailJob = async (req, res) => {
  try {
    console.log("Manual trigger of competition email job requested");
    
    // Run the job
    await runCompetitionEmailJobNow();

    res.status(200).json({
      status: "success",
      message: "Competition email job executed successfully. Check server logs for details.",
    });
  } catch (error) {
    console.error("Error triggering competition email job:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to trigger competition email job",
    });
  }
};
