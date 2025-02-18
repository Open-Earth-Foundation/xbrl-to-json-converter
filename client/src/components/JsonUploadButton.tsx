// client\src\components\JsonUploadButton.tsx

import React, { useState } from 'react';
import { useToast } from "../hooks/use-toast";

const API_BASE_URL =
  globalThis?.config?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export default function JsonUploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const userId = localStorage.getItem('userId');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('websocket_user_id', userId || '');

      const response = await fetch(API_BASE_URL + '/upload_json_file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setIsUploaded(true);
      toast({
        title: "Success",
        description: "JSON file uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload JSON file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".json"
        onChange={handleUpload}
        className="hidden"
        id="json-upload"
      />
      <label
        htmlFor="json-upload"
        className={`px-4 py-2 rounded cursor-pointer inline-flex items-center justify-center
          ${isUploaded
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-blue-500 hover:bg-blue-600'}
          text-white transition-colors min-w-[120px]`}
      >
        {isUploading ? 'Uploading...' : isUploaded ? 'Uploaded' : 'Upload JSON'}
      </label>
    </div>
  );
}
