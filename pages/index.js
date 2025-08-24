import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a Word file first");

    const formData = new FormData();
    formData.append("file", file);

    setMessage("Uploading...");

    const res = await fetch("/api/convert", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.url) {
      setMessage("Conversion complete! Download your PDF:");
      window.open(data.url, "_blank");
    } else {
      setMessage("Conversion failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Word → PDF Converter</h1>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Convert to PDF</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
