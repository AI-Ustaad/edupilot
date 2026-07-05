"use client";
import React, { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  aspect?: "square" | "video"; // square for logo, video for cover
}

export default function ImageUpload({ label, value, onChange, aspect = "square" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      setLoading(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";
  const iconSize = aspect === "video" ? 48 : 32;

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {value ? (
          <div className={`relative ${aspectClass} w-full border-2 border-gray-200 rounded-2xl overflow-hidden group`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-gray-800 p-2 rounded-lg font-bold text-xs flex items-center gap-1"
              >
                <Upload size={14} /> Change
              </button>
              <button 
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white p-2 rounded-lg font-bold text-xs flex items-center gap-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`${aspectClass} w-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500 transition`}
          >
            {loading ? <Loader2 className="animate-spin" size={iconSize} /> : <Upload size={iconSize} />}
            <p className="text-xs font-bold mt-2">Click to Upload</p>
            <p className="text-[10px] text-gray-400">PNG, JPG, SVG</p>
          </button>
        )}
      </div>
    </div>
  );
}
