import React, { useState, useRef, type ChangeEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleGenAI, createPartFromUri } from "@google/genai";
import type { Part } from "@google/genai";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const GEMINI_API_KEY = "AIzaSyB-9tUxMgq-njNfkhjYi86u5sOvI1xYg-k";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function extractJSONFromText(text: string): string | null {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) return null;
  let depth = 0;
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(firstBrace, i + 1);
    }
  }
  return null;
}

const Main: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const resumeRef = useRef<HTMLDivElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      toast.info("Resume uploaded successfully ✅");
    }
  };

  const handleGenerateResume = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      toast.error("Please upload a resume and enter a job description!");
      return;
    }
    setLoading(true);
    setResumeData(null);
    try {
      const uploadedFile = await ai.files.upload({
        file: new Blob([resumeFile], { type: resumeFile.type }),
        config: { displayName: resumeFile.name },
      });
      if (!uploadedFile.name) throw new Error("File upload failed");
      let getFile = await ai.files.get({ name: uploadedFile.name });
      while (getFile.state === "PROCESSING") {
        await new Promise((r) => setTimeout(r, 2000));
        if (!getFile.name) throw new Error("File name missing");
        getFile = await ai.files.get({ name: getFile.name });
      }
      if (getFile.state === "FAILED") throw new Error("File processing failed");
      const prompt = `You are a professional resume writer. Rewrite this resume tailored for the job description provided. Optimize it for ATS. Output STRICT JSON ONLY in this schema:
{
  "name":"string",
  "title":"string",
  "contact":{"email":"string","phone":"string","linkedin":"string"},
  "summary":"string",
  "skills":["string"],
  "experience":[{"role":"string","company":"string","duration":"string","achievements":["string"]}],
  "education":[{"degree":"string","university":"string","year":"string"}],
  "projects":[{"name":"string","description":"string","tech":["string"]}]
}
Job Description: ${jobDescription}
Return only JSON and do not wrap it with markdown or backticks.`;
      const contents: (string | Part)[] = [prompt];
      if (getFile.uri && getFile.mimeType) contents.push(createPartFromUri(getFile.uri, getFile.mimeType));
      const genAIResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });
      const rawText =
        (genAIResponse as any)?.text ??
        (Array.isArray((genAIResponse as any)?.output) &&
          (genAIResponse as any).output.map((o: any) => (o?.content ?? []).map((c: any) => c?.text ?? "").join(" ")).join(" ")) ??
        "";
      const extracted = extractJSONFromText(rawText);
      if (!extracted) throw new Error("AI response did not contain valid JSON");
      const parsed = JSON.parse(extracted);
      setResumeData(parsed);
      toast.success("Resume generated successfully 🎉");
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
      console.log(err?.message);
      
    } finally {
      setLoading(false);
    }
  };

 const handleDownloadPDF = async () => {
  if (!resumeRef.current) {
    toast.error("Nothing to download");
    return;
  }
  try {
    toast.info("Preparing PDF...");
    const element = resumeRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = (pdf as any).getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${(resumeData?.name ?? "resume").replace(/\s+/g, "_")}.pdf`;
    pdf.save(filename);
    toast.success("PDF downloaded ✅");
  } catch (e: any) {
    toast.error("Failed to generate PDF");
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Resume Optimiser</h1>
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste Job Description here..." className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        <button onClick={handleGenerateResume} disabled={loading} className={`w-full py-3 px-6 font-semibold rounded-lg shadow-md transition ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>{loading ? "Generating..." : "Generate Resume"}</button>
      </div>

      {resumeData && (
        <div className="mt-8 w-full max-w-3xl">
          <div className="flex justify-end mb-4 gap-2">
            <button onClick={handleDownloadPDF} className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Download PDF</button>
          </div>
          <div ref={resumeRef} className="bg-white shadow-xl rounded-2xl p-8 font-poppins text-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-700">{resumeData?.name ?? "Name"}</h1>
                <p className="text-lg text-gray-600">{resumeData?.title ?? "Title"}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>📧 {resumeData?.contact?.email ?? ""}</p>
                <p>📞 {resumeData?.contact?.phone ?? ""}</p>
                <p>🔗 {resumeData?.contact?.linkedin ?? ""}</p>
              </div>
            </div>

            <section className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-1 mb-2 text-blue-600">Summary</h2>
              <p className="text-gray-700">{resumeData?.summary ?? ""}</p>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-1 mb-2 text-blue-600">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(resumeData?.skills) ? resumeData.skills.map((skill: string, idx: number) => <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{skill}</span>) : null}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-1 mb-2 text-blue-600">Experience</h2>
              {Array.isArray(resumeData?.experience) ? resumeData.experience.map((exp: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <h3 className="text-lg font-bold">{exp?.role ?? ""}</h3>
                  <p className="text-sm text-gray-600">{exp?.company ?? ""} • {exp?.duration ?? ""}</p>
                  <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                    {Array.isArray(exp?.achievements) ? exp.achievements.map((ach: string, i: number) => <li key={i}>{ach}</li>) : null}
                  </ul>
                </div>
              )) : null}
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-1 mb-2 text-blue-600">Education</h2>
              {Array.isArray(resumeData?.education) ? resumeData.education.map((edu: any, idx: number) => <p key={idx} className="mt-2">{edu?.degree ?? ""}, {edu?.university ?? ""} ({edu?.year ?? ""})</p>) : null}
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-1 mb-2 text-blue-600">Projects</h2>
              {Array.isArray(resumeData?.projects) ? resumeData.projects.map((proj: any, idx: number) => (
                <div key={idx} className="mt-2">
                  <p className="font-semibold">{proj?.name ?? ""}</p>
                  <p className="text-sm text-gray-700">{proj?.description ?? ""}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.isArray(proj?.tech) ? proj.tech.map((t: string, i: number) => <span key={i} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{t}</span>) : null}
                  </div>
                </div>
              )) : null}
            </section>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
    </div>
  );
};

export default Main;
