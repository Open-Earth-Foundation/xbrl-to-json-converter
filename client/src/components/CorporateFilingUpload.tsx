
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { getUserId } from "../utils/user";
import { useToast } from "./ui/use-toast";
import { FileUpload, FileJson, FileCheck } from "lucide-react";

const API_BASE_URL =
  globalThis?.config?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export default function CorporateFilingUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSource, setFileSource] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setFileSource("upload");
    const userId = getUserId();
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('websocket_user_id', userId || '');
      
      const response = await fetch(API_BASE_URL + '/upload_file', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      setFileName(file.name);
      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      setFileName(null);
      setFileSource(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const usePreloadedFile = async () => {
    setIsUploading(true);
    setFileSource("preloaded");
    const userId = getUserId();
    
    try {
      const response = await fetch(API_BASE_URL + '/use_preloaded', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websocket_user_id: userId || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to use preloaded file');
      }
      
      setFileName("ESRS-Mockup-Example.xbrl");
      toast({
        title: "Success",
        description: "Using preloaded XBRL file"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to use preloaded file",
        variant: "destructive"
      });
      setFileName(null);
      setFileSource(null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setFileSource("json");
    const userId = getUserId();
    
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
      
      setFileName(file.name);
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
      setFileName(null);
      setFileSource(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Corporate Filing</h2>
        
        <div className="space-y-6">
          {/* Option 1: Preloaded file */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="font-medium mb-2 flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-blue-500" />
              Don't have a file? Use a Preloaded Mockup File
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Use our sample XBRL file to explore the system capabilities.
            </p>
            <Button
              onClick={usePreloadedFile}
              disabled={isUploading}
              variant="outline"
              className="w-full"
            >
              {isUploading && fileSource === "preloaded" ? "Loading..." : "Use Preloaded"}
            </Button>
          </div>
          
          {/* Option 2: XBRL upload */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="font-medium mb-2 flex items-center">
              <FileUpload className="mr-2 h-5 w-5 text-green-500" />
              Have an XBRL file? Upload it
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload your XBRL document for processing and analysis.
            </p>
            <input
              type="file"
              accept=".xbrl,.xml"
              onChange={handleFileChange}
              className="hidden"
              id="xbrl-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="xbrl-upload"
              className="inline-block w-full cursor-pointer"
            >
              <div className="bg-white border border-gray-300 rounded text-center py-2 px-4 hover:bg-gray-50 transition-colors">
                {isUploading && fileSource === "upload" ? "Uploading..." : "Choose File"}
              </div>
            </label>
          </div>
          
          {/* Option 3: JSON upload */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="font-medium mb-2 flex items-center">
              <FileJson className="mr-2 h-5 w-5 text-purple-500" />
              Have a JSON filing? Upload it
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload a preprocessed JSON file if you already have one.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleJsonUpload}
              className="hidden"
              id="json-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="json-upload"
              className="inline-block w-full cursor-pointer"
            >
              <div className="bg-white border border-gray-300 rounded text-center py-2 px-4 hover:bg-gray-50 transition-colors">
                {isUploading && fileSource === "json" ? "Uploading..." : "Upload JSON"}
              </div>
            </label>
          </div>
        </div>
        
        {fileName && (
          <div className="mt-6 p-3 bg-green-50 border border-green-100 rounded-md">
            <p className="text-green-800 font-medium flex items-center">
              <FileCheck className="mr-2 h-5 w-5" />
              {fileSource === "preloaded" 
                ? "Using Preloaded Mockup File" 
                : `Using ${fileName}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
