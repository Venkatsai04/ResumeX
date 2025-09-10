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
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: { fontSize: 16, fontWeight: "bold", color: "#2563eb", marginBottom: 4 },
  title: { fontSize: 12, marginBottom: 8 },
  contact: { fontSize: 10, color: "#444", marginBottom: 12 },
  subHeader: { fontSize: 13, marginTop: 10, fontWeight: "bold", color: "#1f2937" },
  text: { marginTop: 4, lineHeight: 1.3 },
  listItem: { marginLeft: 12, marginTop: 2 },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
});

const ResumePDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{data.name}</Text>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.contact}>
        {data.contact.email} | {data.contact.phone} | {data.contact.linkedin}
      </Text>

      <Text style={styles.subHeader}>Summary</Text>
      <Text style={styles.text}>{data.summary}</Text>

      <Text style={styles.subHeader}>Skills</Text>
      {data.skills.map((s: string, i: number) => (
        <Text key={i} style={styles.listItem}>• {s}</Text>
      ))}

      <Text style={styles.subHeader}>Experience</Text>
      {data.experience.map((exp: any, i: number) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <Text style={styles.bold}>
            {exp.role} — {exp.company}
          </Text>
          <Text style={styles.italic}>{exp.duration}</Text>
          {exp.achievements.map((a: string, j: number) => (
            <Text key={j} style={styles.listItem}>• {a}</Text>
          ))}
        </View>
      ))}

      <Text style={styles.subHeader}>Education</Text>
      {data.education.map((edu: any, i: number) => (
        <Text key={i} style={styles.text}>
          <Text style={styles.bold}>{edu.degree}</Text>, {edu.university} ({edu.year})
        </Text>
      ))}

      <Text style={styles.subHeader}>Projects</Text>
      {data.projects.map((proj: any, i: number) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <Text style={styles.bold}>{proj.name}</Text>
          <Text style={styles.text}>{proj.description}</Text>
          <Text style={styles.text}>
            <Text style={styles.italic}>Tech:</Text> {proj.tech.join(", ")}
          </Text>
        </View>
      ))}
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
          className={`w-full py-3 px-6 font-semibold rounded-lg shadow-md transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Generating..." : "Generate Resume"}
        </button>
      </div>

      {resumeData && (
        <div className="mt-8 w-full max-w-3xl flex justify-end">
          <PDFDownloadLink
            document={<ResumePDF data={resumeData} />}
            fileName={`${resumeData.name.replace(/\s+/g, "_")}_Resume.pdf`}
          >
            {({ loading }) => (
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                {loading ? "Preparing PDF..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
    </div>
  );
};

export default Main;
