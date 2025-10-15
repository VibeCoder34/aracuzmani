"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";

interface UploadedImage {
  url: string;
  path: string;
  fileName: string;
}

interface ImageUploaderProps {
  onUploadComplete?: (images: UploadedImage[]) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [carSlug, setCarSlug] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!carSlug || carSlug.trim() === "") {
      setError("Please enter a car slug first");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("carSlug", carSlug);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload image");
        }

        return res.json();
      });

      const results = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...results];
      setUploadedImages(newImages);
      
      if (onUploadComplete) {
        onUploadComplete(newImages);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (image: UploadedImage) => {
    try {
      const res = await fetch(`/api/admin/upload-image?path=${encodeURIComponent(image.path)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete image");
      }

      const newImages = uploadedImages.filter((img) => img.path !== image.path);
      setUploadedImages(newImages);
      
      if (onUploadComplete) {
        onUploadComplete(newImages);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        Upload Car Images
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="car-slug">Car Slug *</Label>
          <Input
            id="car-slug"
            value={carSlug}
            onChange={(e) => setCarSlug(e.target.value)}
            placeholder="e.g., toyota-corolla-2024"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be used in the filename: {carSlug || "[slug]"}-[timestamp].jpg
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading || !carSlug}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${!carSlug ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP up to 10MB (multiple files allowed)
            </p>
          </label>
        </div>

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading images...
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">
              Uploaded Images ({uploadedImages.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {uploadedImages.map((image) => (
                <div
                  key={image.path}
                  className="relative group rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveImage(image)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-2">
                    <p className="text-xs text-white truncate font-mono">
                      {image.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Public URLs:</p>
            {uploadedImages.map((image) => (
              <div key={image.path} className="mb-2">
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 block overflow-x-auto">
                  {image.url}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

