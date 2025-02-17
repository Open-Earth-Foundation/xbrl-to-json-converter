// client\src\components\JsonUploadButton.tsx

import React, { useState } from 'react';
import { useToast } from "../hooks/use-toast";

export default function JsonUploadButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId') || '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('websocket_user_id', userId);

      const resp = await fetch(`http://localhost:8000/upload_json_file`, {
        method: 'POST',
        body: formData
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Failed uploading JSON');
      }
      const data = await resp.json();
      if (data.user_id) {
        localStorage.setItem('userId', data.user_id);
      }

      toast({
        title: 'JSON Uploaded',
        description: data.message,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label
        htmlFor="json-upload-input"
        className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600"
      >
        {loading ? 'Uploading...' : 'Upload JSON'}
      </label>
      <input
        type="file"
        id="json-upload-input"
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />
    </div>
  );
}
