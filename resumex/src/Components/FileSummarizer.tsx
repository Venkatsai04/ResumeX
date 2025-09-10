import React, { useState } from 'react';
import { createPartFromUri, GoogleGenAI } from '@google/genai';
import type { Part } from '@google/genai';

// Replace with your actual API key
const GEMINI_API_KEY = "AIzaSyB-9tUxMgq-njNfkhjYi86u5sOvI1xYg-k";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const FileSummarizer: React.FC = () => {
    const [summary, setSummary] = useState<string>('Please upload a PDF file to summarize.');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a valid PDF file.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSummarize = async () => {
        if (!file) {
            setError('No file selected.');
            return;
        }

        setLoading(true);
        setError(null);
        setSummary('Processing file, please wait...');
        setProgress(0); // Reset progress on new submission

        try {
            // Step 1: Uploading file
            setProgress(10);
            const uploadedFile = await ai.files.upload({
                file: new Blob([file], { type: file.type }),
                config: {
                    displayName: file.name,
                },
            });
            setProgress(30);

            if (!uploadedFile.name) {
                throw new Error('File upload failed, no name was returned.');
            }

            // Step 2: Processing file
            let getFile = await ai.files.get({ name: uploadedFile.name });
            while (getFile.state === 'PROCESSING') {
                setProgress((prev) => Math.min(prev + 5, 80));
                await new Promise((resolve) => setTimeout(resolve, 3000));

                if (!getFile.name) {
                    throw new Error('File name missing during processing status check.');
                }
                getFile = await ai.files.get({ name: getFile.name });
            }
            setProgress(80);

            if (getFile.state === 'FAILED') {
                throw new Error('File processing failed on the server.');
            }

            // Step 3: Generating summary
            const content: (string | Part)[] = ['generate new resume based on my resume for a backend developer focusing on python django and ATS free. Use action words.single page same formatt '];
            if (getFile.uri && getFile.mimeType) {
                content.push(createPartFromUri(getFile.uri, getFile.mimeType));
            } else {
                throw new Error('Uploaded file URI or MIME type is missing.');
            }

            const genAIResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: content,
            });
            setProgress(100);

            // Finalizing
            if (genAIResponse.text) {
                setSummary(genAIResponse.text);
            } else {
                setSummary('Summary generation failed: The response text was empty.');
            }

        } catch (err: any) {
            console.error("Error summarizing document:", err);
            setError(err.message || 'An unknown error occurred.');
            setSummary('Failed to generate summary.');
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">PDF Summarizer</h2>
            
            <div className="flex flex-col space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                    Upload your resume (PDF)
                </label>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-violet-50 file:text-violet-700
                                hover:file:bg-violet-100"
                />

                <button
                    onClick={handleSummarize}
                    disabled={!file || loading}
                    className={`w-full py-2 px-4 rounded-md font-semibold text-white transition-colors duration-200
                                ${!file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Processing...' : 'Generate Backend Resume'}
                </button>
            </div>

            {loading && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-2">{summary}</p>
                </div>
            )}
            
            {!loading && summary && (
                <div className="mt-4 p-4 bg-white rounded-md shadow-inner whitespace-pre-wrap">
                    <p className="text-gray-800">{summary}</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <p className="font-medium">{error}</p>
                </div>
            )}
        </div>
    );
};

export default FileSummarizer;