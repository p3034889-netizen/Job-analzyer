import axios from "axios";
import { calculateJobMatch } from "../utilses/utiles.match.js";
import { IT_DOMAINS } from "../utilses/it.domain.js";

function extractSkills(resumeText = "") {
  const text = resumeText.toLowerCase();
  const foundSkills = new Set();

  for (const domain in IT_DOMAINS) {
    if (domain === "soft_skills") continue;
    IT_DOMAINS[domain].forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    });
  }

  return Array.from(foundSkills);
}

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

  
    const skills = extractSkills(resumeText);

    
    const searchQuery = buildSearchQuery(skills);

    console.log("Generated Job Query:", searchQuery);

   
    const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: {
        query: searchQuery,
        page: 1,
        num_pages: 1
      },
      headers: {
        "X-RapidAPI-Key": process.env.JOB_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    const jobData = response?.data?.data || [];

    if (!jobData.length) {
      return res.json({
        success: true,
        skills,
        searchQuery,
        jobs: [],
        message: "No jobs found for your resume at this time."
      });
    }

    
    const jobs = jobData.map(job => {
      const match = calculateJobMatch(resumeText, job.job_description || "");

      return {
        company: job.employer_name || "Unknown",
        position: job.job_title || "Not specified",
        location: job.job_location || "Remote",
        salary: job.job_min_salary
          ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_period}`
          : "Not disclosed",
        matchPercentage: match.percentage,
        matchedSkills: match.matched,
        missingSkills: match.missing
      };
    });

    
    res.json({
      success: true,
      skills,
      searchQuery,
      jobs
    });

  } catch (err) {
    console.error("JOB ERROR:", err.message);
    res.status(500).json({ message: "Job fetch failed" });
  }
};
