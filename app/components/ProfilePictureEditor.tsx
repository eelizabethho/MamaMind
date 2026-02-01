"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ProfilePictureEditorProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  userName?: string | null;
}

export default function ProfilePictureEditor({
  currentImage,
  onImageChange,
  userName,
}: ProfilePictureEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange(result);
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {preview ? (
        preview.startsWith("data:") ? (
          <img
            src={preview}
            alt={userName || "User"}
            width={80}
            height={80}
            style={{
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(97, 64, 81, 0.3)",
              border: "3px solid #614051",
              cursor: "pointer",
              transition: "all 0.3s ease",
              objectFit: "cover",
            }}
            onClick={handleClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        ) : (
          <Image
            src={preview}
            alt={userName || "User"}
            width={80}
            height={80}
            style={{
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(97, 64, 81, 0.3)",
              border: "3px solid #614051",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={handleClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        )
      ) : (
        <div
          onClick={handleClick}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#614051",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(97, 64, 81, 0.3)",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4a2d3f";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#614051";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </div>
      )}
      
      {/* Edit icon overlay */}
      <div
        onClick={handleClick}
        style={{
          position: "absolute",
          bottom: "0",
          right: "0",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "#614051",
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#4a2d3f";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#614051";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
