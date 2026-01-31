import axios from "axios";
import Job from "../modules/job.modules.js";
import { calculateJobMatch } from "../utilses/utiles.match.js";
import { IT_DOMAINS } from "../utilses/it.domain.js";

/* 🔹 Extract skills from resume */
function extractSkills(resumeText = "") {
  const text = resumeText.toLowerCase();
  const foundSkills = new Set();

  for (const domain in IT_DOMAINS) {
    if (domain === "soft_skills") continue;

    IT_DOMAINS[domain].forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.add(skill.toLowerCase());
      }
    });
  }

  return Array.from(foundSkills);
}

/* 🔹 Build API search query */
function buildSearchQuery(skills = []) {
  if (!skills.length) return "software developer";
  return skills.slice(0, 6).join(" ");
}

export const recommendJobs = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: "Resume required" });
    }

    /* 1️⃣ Extract skills */
    const skills = extractSkills(resumeText);
    const searchQuery = buildSearchQuery(skills);

    /* 2️⃣ Fetch jobs from API */
    const response = await axios.get(
      "https://jsearch.p.rapidapi.com/search",
      {
        params: { query: searchQuery, page: 1, num_pages: 1 },
        headers: {
          "X-RapidAPI-Key": process.env.JOB_API_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
      }
    );

    const apiJobs = response?.data?.data || [];

    if (!apiJobs.length) {
      return res.json({
        success: true,
        skills,
        searchQuery,
        jobs: [],
        message: "No jobs found for your resume."
      });
    }

    /* 3️⃣ Process + Save Jobs */
    const savedJobs = [];

    for (const job of apiJobs) {
      const match = calculateJobMatch(
        resumeText,
        job.job_description || ""
      );

      /* 🔁 Avoid duplicate jobs */
      const exists = await Job.findOne({
        title: job.job_title,
        company: job.employer_name
      });

      if (exists) {
        savedJobs.push({
          ...exists._doc,
          matchPercentage: match.percentage,
          matchedSkills: match.matched,
          missingSkills: match.missing
        });
        continue;
      }

      /* 🧠 Create job document */
      const newJob = new Job({
        title: job.job_title || "Not specified",
        company: job.employer_name || "Unknown",
        location: job.job_location || "Remote",
        jobType: "Full-time",
        experienceLevel: "Fresher",
        skills,
        description: job.job_description || "",
        salary: job.job_min_salary
          ? `${job.job_min_salary} - ${job.job_max_salary}`
          : "Not disclosed",
        applyLink: job.job_apply_link || "#",
        isRemote: job.job_is_remote || false
      });

      await newJob.save();

      savedJobs.push({
        ...newJob._doc,
        matchPercentage: match.percentage,
        matchedSkills: match.matched,
        missingSkills: match.missing
      });
    }

    /* 4️⃣ Final response */
    res.json({
      success: true,
      skills,
      searchQuery,
      jobs: savedJobs
    });

  } catch (err) {
    console.error("JOB ERROR:", err.message);
    res.status(500).json({ message: "Job fetch failed" });
  }
};
