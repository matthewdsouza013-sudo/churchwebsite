import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/certificates",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    cb(new Error("Only PDF files allowed"), false);
  }
  cb(null, true);
};

export const uploadCertificatePdf = multer({
  storage,
  fileFilter,
});
