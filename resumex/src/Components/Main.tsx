import React, { useState, type ChangeEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Main: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      toast.info("Resume uploaded successfully ✅");
    }
  };

  const handleGenerateResume = () => {
    if (!resumeFile || !jobDescription.trim()) {
      toast.error("Please upload a resume and enter a job description!");
      return;
    }


  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
        Resume Optimiser
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        {/* Job Description */}
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste Job Description here..."
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* File Upload */}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        {/* Generate Button */}
        <button
          onClick={handleGenerateResume}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Generate Resume
        </button>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
    </div>
  );
};

export default Main;
