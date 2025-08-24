import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/convert", { method: "POST", body: formData });
    const blob = await res.blob();
    setDownloadUrl(URL.createObjectURL(blob));
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Word ⇄ PDF Converter</h1>
      <input type="file" accept=".docx,.pdf" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
      <button onClick={handleUpload} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        {loading ? "Converting..." : "Convert"}
      </button>
      {downloadUrl && (
        <a href={downloadUrl} download className="mt-6 text-blue-600 underline">
          Download File
        </a>
      )}
    </div>
  );
}
