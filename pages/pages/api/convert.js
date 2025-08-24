import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload error" });

    const fileStream = fs.createReadStream(files.file.filepath);
    const ext = files.file.originalFilename.split(".").pop().toLowerCase();
    const direction = ext === "pdf" ? "pdf/to/docx" : "docx/to/pdf";
    const mime = ext === "pdf"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/pdf";

    const resApi = await fetch(`https://v2.convertapi.com/convert/${direction}?Secret=${process.env.CONVERT_API_KEY}`, {
      method: "POST", body: fileStream
    });

    if (!resApi.ok) return res.status(500).json({ error: "Conversion failed" });
    const data = await resApi.buffer();

    res.setHeader("Content-Type", mime);
    res.send(data);
  });
}
