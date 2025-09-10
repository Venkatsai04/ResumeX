import React, { useState } from "react";

const Main = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleGenerate = () => {
    if (!jobDescription || !resumeFile) {
      alert("Please enter Job Description and upload your resume.");
      return;
    }
    // Simulate AI processing delay
    setTimeout(() => {
      setSuccess(true);
    }, 1200);
  };

  const handleDownload = () => {
    alert("Download triggered (replace with real backend file).");
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col justify-between font-inter">
      {/* Main Section */}
      <main className="flex-grow px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="font-poppins text-3xl font-bold text-gray-900">
            Resumex
          </h1>
        </header>

        {/* Container */}
        <div className="max-w-md mx-auto">
          {/* Intro */}
          <div className="text-center mb-8">
            <h2 className="font-poppins text-2xl font-semibold text-gray-900">
              Optimize Your Resume with AI
            </h2>
            <p className="mt-2 text-gray-600">
              Paste the job description and upload your resume to get an
              optimized version.
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            {/* Job Description */}
            <div>
              <label htmlFor="job-description" className="sr-only">
                Job Description
              </label>
              <textarea
                id="job-description"
                className="w-full h-40 resize-none rounded-xl border border-gray-300 bg-white p-4 text-base shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Paste Job Description Here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label htmlFor="resume-upload" className="sr-only">
                Upload Resume
              </label>
              <div className="file-input-wrapper rounded-xl p-6 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="material-symbols-outlined text-4xl text-gray-400">
                    upload_file
                  </span>
                  <p className="text-gray-600">
                    <span className="font-semibold text-blue-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    DOCX or PDF (max. 5MB)
                  </p>
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".docx,.pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>
              {resumeFile && (
                <p className="mt-2 text-sm text-gray-700">
                  Selected: <span className="font-medium">{resumeFile.name}</span>
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center rounded-xl bg-blue-600 text-white h-14 px-5 text-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform active:scale-95"
            >
              Generate Optimized Resume
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-8 p-4 bg-green-100 border border-green-200 rounded-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  task_alt
                </span>
                <h3 className="ml-2 font-poppins text-xl font-semibold text-green-800">
                  Success!
                </h3>
              </div>
              <p className="text-gray-700 mb-2">Your optimized resume is ready.</p>
              <div className="flex items-center justify-center mb-4">
                <p className="text-lg font-medium text-gray-800">Match Score:</p>
                <span className="ml-2 text-2xl font-bold text-blue-600">92%</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center rounded-xl bg-blue-600 text-white h-12 px-5 font-semibold hover:bg-blue-700 transition"
              >
                <span className="material-symbols-outlined mr-2">download</span>
                Download Resume
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <nav className="flex justify-around items-center max-w-md mx-auto px-4 py-2">
          <a
            href="#"
            className="flex flex-col items-center justify-center gap-1 text-blue-600"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a
            href="#"
            className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span className="material-symbols-outlined">info</span>
            <span className="text-xs font-medium">About</span>
          </a>
          <a
            href="#"
            className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span className="material-symbols-outlined">mail</span>
            <span className="text-xs font-medium">Contact</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default Main;
