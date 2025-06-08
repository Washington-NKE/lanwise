import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  console.log("Upload API called");
  
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Missing Cloudinary configuration");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    console.log("Getting form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("File received:", file ? `${file.name} (${file.size} bytes)` : "No file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error("Invalid file type:", file.type);
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error("File too large:", file.size);
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    console.log("Converting file to base64...");
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    console.log("Uploading to Cloudinary...");
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "quiz-images",
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // Limit size to reduce storage
        { quality: "auto:good" }, // Optimize quality
        { fetch_format: "auto" } // Auto-select best format
      ]
    });

    console.log("Upload successful:", result.secure_url);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Detailed error uploading image:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('Invalid image')) {
        return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
      } else if (error.message.includes('api_key')) {
        return NextResponse.json({ error: "Upload service configuration error" }, { status: 500 });
      }
    }
    
    return NextResponse.json(
      { error: "Error uploading image: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}