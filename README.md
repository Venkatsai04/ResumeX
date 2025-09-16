# Resumex – AI Resume Optimizer ⚡

Resumex is a smart web app that helps job seekers optimize their resumes against job descriptions using **Google Gemini AI**.  
It generates an **ATS-friendly, tailored resume** and provides a **match score**, ensuring better chances of getting shortlisted.

---

## 🚀 Features
- 📂 Upload your existing resume (PDF/DOC/DOCX)  
- 📝 Paste the Job Description (JD)  
- 🤖 AI-powered resume rewriting using **Gemini 2.5 Flash**  
- 📊 ATS Match Score included in the output  
- 📄 Download resume as a **formatted PDF** (Times New Roman, single-page)  
- ⚡ Compact, professional, and recruiter-ready  

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS  
- **AI Integration:** Google Generative AI (Gemini API)  
- **PDF Generation:** @react-pdf/renderer  
- **Notifications:** react-toastify  

---

## 📌 How It Works
1. Enter the Job Description.  
2. Upload your resume file.  
3. Click **Generate Resume**.  
4. Get an **ATS-optimized resume** + **match score**.  
5. Download your professional PDF.  

---

## 📷 Screenshots
(Add screenshots or GIFs here of the upload, generate, and PDF download flow)

---

## ⚡ Getting Started

```bash
# Clone the repo
git clone https://github.com/Venkatsai04/ResumeX.git

# Install dependencies
npm install

# Start the development server
npm run dev

## Set your Gemini API Key inside Main.tsx:
const GEMINI_API_KEY = "YOUR_API_KEY";
