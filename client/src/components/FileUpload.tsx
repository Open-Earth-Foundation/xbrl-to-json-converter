import React, { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { api } from '../lib/api';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setFile(e.target.files[0]);
    setError(null);
    setLoading(true);

    try {
      const data = await api.upload(e.target.files[0]);
      setUserId(data.user_id);
      localStorage.setItem('userId', data.user_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Upload XBRL File</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".xml,.xbrl"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {loading && <p className="mt-2">Uploading...</p>}
        {error && <p className="mt-2 text-red-500">{error}</p>}
        {userId && <p className="mt-2 text-green-500">File uploaded successfully!</p>}
      </CardContent>
    </Card>
  );
}