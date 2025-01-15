import React, { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { api } from '../lib/api';
import { useToast } from "../hooks/use-toast";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setFile(e.target.files[0]);
    setLoading(true);

    try {
      const data = await api.upload(e.target.files[0]);
      localStorage.setItem('userId', data.user_id);
      
      toast({
        title: "Success",
        description: "File uploaded successfully!",
        duration: 3000,
        
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Upload failed',
        variant: "destructive",
      });
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
        {loading && (
          <div className="mt-2 text-blue-600">
            Uploading and processing file...
          </div>
        )}
      </CardContent>
    </Card>
  );
}