import { getCloudinary } from "@/lib/cloudinary";

export async function saveStudentPhoto(applicationNumber: string, photoDataUrl: string) {
  const safeApplicationNumber = applicationNumber.replace(/[^a-zA-Z0-9-_]/g, "-");
  const cloudinary = getCloudinary();
  const result = await cloudinary.uploader.upload(photoDataUrl, {
    folder: "hypatia/students",
    public_id: safeApplicationNumber,
    overwrite: true,
    resource_type: "image",
  });

  return result.secure_url;
}
