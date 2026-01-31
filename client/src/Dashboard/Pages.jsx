import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";
import { useUser, useAuth } from "@clerk/clerk-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const ATS_API = "http://localhost:5000/api/resume/ats";
const JOB_API = "http://localhost:5000/api/jobs/recommend";

const Dashboard = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [score, setScore] = useState(null);
  const [matched, setMatched] = useState([]);
  const [missing, setMissing] = useState([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [jobMessage, setJobMessage] = useState("");
  const [showJobsButton, setShowJobsButton] = useState(false);

  const [view, setView] = useState("dashboard"); // sidebar toggle

  // PDF Extraction
  async function extractTextFromPDF(file) {
    const fileReader = new FileReader();
    return new Promise((resolve) => {
      fileReader.onload = async () => {
        const typedArray = new Uint8Array(fileReader.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(" ") + " ";
        }
        resolve(fullText);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  // Analyze Resume
  const handleAnalyze = async () => {
    setLoading(true);
    setJobs([]);
    setJobMessage("");
    setShowJobsButton(false);

    let finalText = resumeText;
    if (resumeFile) {
      if (resumeFile.type !== "application/pdf") {
        alert("Please upload a PDF file only");
        setLoading(false);
        return;
      }
      finalText = await extractTextFromPDF(resumeFile);
    }

    if (!finalText.trim()) {
      alert("Please upload or paste your resume");
      setLoading(false);
      return;
    }

    try {
      const atsRes = await fetch(ATS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: finalText }),
      });

      const atsData = await atsRes.json();
      setScore(atsData.score ?? 0);
      setMatched(atsData.matched ?? []);
      setMissing(atsData.missing ?? []);
      setDomain(atsData.domain ?? "");

      // Show button for fetching jobs
      setShowJobsButton(true);
    } catch (err) {
      console.error(err);
      alert("Server error while analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Jobs
  const handleViewJobs = async () => {
    setLoading(true);
    setJobs([]);
    setJobMessage("");

    let finalText = resumeText;
    if (resumeFile) finalText = await extractTextFromPDF(resumeFile);

    try {
      const searchQuery = `${domain.replace("_", " ")} ${matched.slice(0, 5).join(" ")}`.trim();

      const jobRes = await fetch(JOB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: finalText, query: searchQuery }),
      });

      const jobData = await jobRes.json();
      setJobs(jobData.jobs || []);
      setJobMessage(jobData.message || "");

      // Optional: switch to Job Listings view automatically
      setView("jobs");
    } catch (err) {
      console.error(err);
      alert("Server error while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setResumeText("");
    setScore(null);
    setMatched([]);
    setMissing([]);
    setDomain("");
    setJobs([]);
    setJobMessage("");
    setShowJobsButton(false);
    document.getElementById("resumeInput").value = null;
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="w-[95%] h-[90%] bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 shadow">
          <h1 className="text-2xl font-semibold">Job Analyzer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-60">
              Domain: {domain ? domain.replace("_", " ") : "—"}
            </span>
            <span className="text-sm opacity-60">
              Welcome {user?.firstName || user?.username || "User"}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex h-full gap-4">

          {/* Sidebar */}
          <div className="w-72 bg-white shadow-lg mt-6 ml-4 rounded-xl p-4">
            <ul className="space-y-3 font-medium">
              <li
                className={`p-2 rounded hover:bg-sky-300 hover:text-white cursor-pointer ${
                  view === "dashboard" ? "bg-sky-200" : ""
                }`}
                onClick={() => setView("dashboard")}
              >
                Dashboard
              </li>
              <li
                className={`p-2 rounded hover:bg-sky-300 hover:text-white cursor-pointer ${
                  view === "jobs" ? "bg-sky-200" : ""
                }`}
                onClick={() => setView("jobs")}
              >
                Job Listings
              </li>
            </ul>
          </div>

          {/* Main */}
          <div className="flex-1 mt-6 p-6 bg-white rounded-lg shadow overflow-y-auto">

            {/* Dashboard view */}
            {view === "dashboard" && (
              <div className="space-y-3 max-h-[75vh]">

                <h2 className="text-xl font-semibold">Analyze your resume (ATS Score)</h2>

                <input
                  id="resumeInput"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="mb-2"
                />

                <textarea
                  rows="5"
                  placeholder="Or paste resume text"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full border p-3 rounded mb-2"
                />

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading ? "Analyzing..." : "Analyze Resume"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                  >
                    Reset
                  </button>
                </div>

                {score !== null && (
                  <div className="bg-blue-50 p-4 rounded mt-4">
                    <h3 className="font-semibold">ATS Score</h3>
                    <p className="text-3xl font-bold text-blue-600">{score}%</p>
                    <p className="text-sm mt-2">
                      <strong>Matched:</strong> {matched.join(", ") || "None"}
                    </p>
                    <p className="text-sm text-red-600">
                      <strong>Missing:</strong> {missing.join(", ") || "None"}
                    </p>

                    {showJobsButton && (
                      <button
                        onClick={handleViewJobs}
                        disabled={loading}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        {loading ? "Loading Jobs..." : "View Recommended Jobs"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Job Listings view */}
            {view === "jobs" && (
              <div className="space-y-3 max-h-[75vh]">
                <h2 className="text-xl font-semibold">Recommended Jobs</h2>
                {jobMessage && !jobs.length && (
                  <p className="text-red-600 mt-2">{jobMessage}</p>
                )}
                {jobs.length > 0 && jobs.map((job, i) => (
                  <div key={i} className="border p-3 rounded">
                    <p className="font-semibold">{job.position}</p>
                    <p>{job.company}</p>
                    <p>{job.location}</p>
                    <p className="text-green-600 font-bold">Match: {job.matchPercentage}%</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
