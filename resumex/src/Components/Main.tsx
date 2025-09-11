import React, { useState, type ChangeEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleGenAI, createPartFromUri } from "@google/genai";
import type { Part } from "@google/genai";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

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

const styles = StyleSheet.create({
  page: { padding: 25, fontSize: 10, fontFamily: "Times-Roman" },
  header: { fontSize: 12, fontWeight: "bold", textAlign: "center" },
  subHeader: { fontSize: 12, textAlign: "center", marginBottom: 5 },
  section: { marginTop: 10, marginBottom: 6 },
  sectionTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 5 },
  text: { marginBottom: 2, lineHeight: 1.3 },
  bullet: { marginLeft: 10, marginBottom: 2 },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
});

const ResumePDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>{data.name}</Text>
      <Text style={styles.subHeader}>
        {data.title} {"\n"}
        {data.contact.email} | {data.contact.phone} | {data.contact.linkedin}
      </Text>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.text}>{data.summary}</Text>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.text}>{data.skills.join(", ")}</Text>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {data.experience.map((exp: any, i: number) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={styles.bold}>
              {exp.role} — {exp.company}
            </Text>
            <Text style={styles.italic}>{exp.duration}</Text>
            {exp.achievements.map((a: string, j: number) => (
              <Text key={j} style={styles.bullet}>
                • {a}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((edu: any, i: number) => (
          <Text key={i} style={styles.text}>
            {edu.degree}, {edu.university} ({edu.year})
          </Text>
        ))}
      </View>

      {/* Projects */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {data.projects.map((proj: any, i: number) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={styles.bold}>{proj.name}</Text>
            {proj.description.map((line: string, j: number) => (
              <Text key={j} style={styles.bullet}>
                • {line}
              </Text>
            ))}
            <Text style={styles.italic}>
              Tech: {proj.tech.join(", ")}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);




const Main: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      const prompt = `You are a professional resume writer and ATS optimization expert.
                      Rewrite this resume tailored to the job description provided. 
                      Use Google’s XYZ formula ("Did X by doing Y to achieve Z") for Experience & Projects.
                      Keep summary 3–4 lines, compact, ATS-friendly, and single-page.2-3 lines for projects.
                      Use this strict JSON schema only:

                      {
                        "matchScore": "number (0-100)",
                       "name":"string",
                        "title":"string",
                        "contact":{"email":"string","phone":"string","linkedin":"string"},
                        "summary":"string",
                        "skills":["string"],
                        "experience":[{"role":"string","company":"string","duration":"string","achievements":["string"]}],
                        "education":[{"degree":"string","university":"string","year":"string"}],
                        "projects":[{"name":"string","description":["string","string"],"tech":["string"]}]
                      }

                      Job Description: ${jobDescription}
                      Return only JSON without markdown.`;


      const contents: (string | Part)[] = [prompt];
      if (getFile.uri && getFile.mimeType)
        contents.push(createPartFromUri(getFile.uri, getFile.mimeType));
      const genAIResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });
      const rawText = (genAIResponse as any)?.text ?? "";
      const extracted = extractJSONFromText(rawText) ?? rawText;
      const parsed = JSON.parse(extracted);
      setResumeData(parsed);
      toast.success("Resume generated successfully 🎉");
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        Resume Optimiser
      </h1>
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-6">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste Job Description here..."
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        <button
          onClick={handleGenerateResume}
          disabled={loading}
          className={`w-full py-3 px-6 font-semibold rounded-lg shadow-md transition ${loading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {loading ? "Generating..." : "Generate Resume"}
        </button>
      </div>

      {resumeData && (
        <div className="flex justify-center mt-10">
          <PDFDownloadLink
            document={<ResumePDF data={resumeData} />}
            fileName={`${resumeData.name.replace(/\s+/g, "_")}_Resume.pdf`}
          >
            {({ loading }) => (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                {loading ? "Preparing PDF..." : "Download Resume"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}

      {resumeData && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-700">
            ATS Match Score:{" "}
            <span className="text-blue-600 text-2xl font-bold">
              {resumeData.matchScore}%
            </span>
          </p>
        </div>
      )}


      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
    </div>
  );
};

export default Main;
