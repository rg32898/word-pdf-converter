import formidable from "formidable";
import fs from "fs";
import CloudConvert from "cloudconvert";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload error" });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

    try {
      // 1️⃣ Upload file to CloudConvert
      const uploadTask = await cloudConvert.tasks.create({
        name: "import-my-file",
        operation: "import/upload",
      });

      const fileData = fs.createReadStream(file.filepath);
      await cloudConvert.tasks.upload(uploadTask, fileData, file.originalFilename);

      // 2️⃣ Convert to PDF
      const convertTask = await cloudConvert.tasks.create({
        name: "convert-my-file",
        operation: "convert",
        input: uploadTask.id,
        output_format: "pdf",
      });

      // 3️⃣ Export file
      const exportTask = await cloudConvert.tasks.create({
        name: "export-my-file",
        operation: "export/url",
        input: convertTask.id,
      });

      // Wait for completion
      const completed = await cloudConvert.jobs.wait(exportTask.id);

      const fileUrl = completed.tasks.find((t) => t.name === "export-my-file")?.result?.files[0]?.url;

      if (!fileUrl) throw new Error("Conversion failed");

      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Conversion failed" });
    }
  });
}
