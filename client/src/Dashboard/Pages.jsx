import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";
import { useUser, useAuth } from "@clerk/clerk-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const BASE_URL = import.meta.env.VITE_API_URL;
const ATS_API = `${BASE_URL}/api/resume/ats`;
const JOB_API = `${BASE_URL}/api/jobs/recommend`;

const Dashboard = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [score, setScore] = useState(null);
  const [matched, setMatched] = useState([]);
  const [missing, setMissing] = useState([]);
  const [domain, setDomain] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobMessage, setJobMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("dashboard");

  /* ================= PDF TEXT EXTRACTION ================= */
  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onload = async () => {
        const pdf = await pdfjsLib
          .getDocument(new Uint8Array(reader.result))
          .promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((i) => i.str).join(" ") + " ";
        }
        resolve(text);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  /* ================= ATS ANALYZE ================= */
  const handleAnalyze = async () => {
    setLoading(true);
    setJobs([]);

    try {
      let finalText = resumeText;

      if (resumeFile) {
        finalText = await extractTextFromPDF(resumeFile);
        setResumeText(finalText); // 🔥 CRITICAL FIX
      }

      if (!finalText.trim()) {
        alert("Upload or paste resume");
        return;
      }

      const res = await fetch(ATS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: finalText }),
      });

      const data = await res.json();

      setScore(data.score ?? 0);
      setMatched(data.matched ?? []);
      setMissing(data.missing ?? []);
      setDomain(data.domain ?? "");
    } catch (err) {
      alert("ATS analysis failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= JOB FETCH ================= */
  const handleViewJobs = async () => {
    if (!resumeText) {
      alert("Resume text missing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(JOB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }), // ✅ FIX
      });

      const data = await res.json();
      setJobs(data.jobs || []);
      setJobMessage(data.message || "");
      setView("jobs");
    } catch {
      alert("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET ================= */
  const handleReset = () => {
    setResumeText("");
    setResumeFile(null);
    setScore(null);
    setMatched([]);
    setMissing([]);
    setDomain("");
    setJobs([]);
    setView("dashboard");
  };

  /* ================= UI ================= */
  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      {/* Header */}
            <div className="w-[95%] h-[90%] bg-white rounded-xl shadow-lg overflow-hidden">

      <div className="flex justify-between items-center px-6 py-4 bg-white border-b">
        <h1 className="text-xl font-semibold">Job Analyzer</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Domain: {domain || "—"}
          </span>
          <span className="text-sm text-gray-500">
            {user?.firstName}
          </span>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-white border-r min-h-screen p-4">
          <button
            onClick={() => setView("dashboard")}
            className={`w-full py-2 rounded mb-2 ${
              view === "dashboard" ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("jobs")}
            disabled={!score}
            className={`w-full py-2 rounded ${
              view === "jobs" ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
          >
            Jobs
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 p-6">
          {view === "dashboard" && (
            <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-center mb-6">
                Resume ATS Analyzer
              </h2>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="w-full border rounded p-2 mb-4"
              />

              <textarea
                rows="6"
                placeholder="Paste resume text"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full border rounded-lg p-4 mb-4 resize-none"
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </button>

                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-6 py-2 rounded"
                >
                  Reset
                </button>
              </div>

              {score !== null && (
                <div className="mt-6 bg-gray-50 border rounded p-4">
                  <p className="text-3xl font-bold text-center text-blue-600">
                    {score}%
                  </p>
                  <p><b>Matched:</b> {matched.join(", ") || "None"}</p>
                  <p className="text-red-600">
                    <b>Missing:</b> {missing.join(", ") || "None"}
                  </p>

                  <div className="text-center mt-4">
                    <button
                      onClick={handleViewJobs}
                      className="bg-green-600 text-white px-6 py-2 rounded"
                    >
                      View Recommended Jobs
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "jobs" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">
                Recommended Jobs
              </h2>

              {jobMessage && (
                <p className="text-red-600 mb-3">{jobMessage}</p>
              )}

              {jobs.map((job, i) => (
                <div key={i} className="bg-white border p-4 rounded mb-3">
                  <p className="font-semibold">{job.title}</p>
                  <p>{job.company}</p>
                  <p>{job.location}</p>
                  <p className="text-green-600">
                    Match: {job.matchPercentage}%
                  </p>
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
