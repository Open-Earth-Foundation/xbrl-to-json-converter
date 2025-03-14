
import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Download, Upload} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {getUserId} from "@/user-id";
import {JsonView, defaultStyles} from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import {Button} from "./ui/button";

const API_BASE_URL =
    globalThis?.config?.VITE_API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

type UploadStatus = {
    type: 'none' | 'preloaded' | 'xbrl' | 'json';
    filename?: string;
};

export default function CorporateFilingUpload() {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({type: 'none'});
    const [loading, setLoading] = useState(false);
    const [jsonFiling, setJsonFiling] = useState();
    const {toast} = useToast();
    const userId = getUserId();

    const handleXbrlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('websocket_user_id', userId || '');

            const response = await fetch(API_BASE_URL + '/upload_file', {
                method: 'POST',
                body: formData,
            });

            // For JSON responses
            const data = await response.json();
            setJsonFiling(data.json_data);

            if (!response.ok) {
                throw new Error('Upload failed');
            }
            setUploadStatus({
                type: 'xbrl',
                filename: file.name
            });

            toast({
                title: "Success",
                description: "XBRL file uploaded and processed successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process XBRL file",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadJson = () => {
        if (!jsonFiling) return;

        // Format the JSON with indentation
        const jsonString = JSON.stringify(jsonFiling, null, 2);

        // Create a blob with the data
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create an object URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;

        // Set the filename - use the original filename if available, otherwise use a default
        const filename = uploadStatus.filename
            ? `${uploadStatus.filename.split('.')[0]}.json`
            : 'corporate-filing.json';

        downloadLink.download = filename;

        // Append to the document, click it, and remove it
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up the object URL
        URL.revokeObjectURL(url);

        toast({
            title: "Downloaded",
            description: `JSON saved as ${filename}`
        });
    };

    return (
        <>
            <Card className="mb-4">
                <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Corporate Filing</h2>

                    <div>
                        <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <Upload className="h-5 w-5 text-green-600"/>
                                <h3 className="font-medium">Upload your XBRL file</h3>
                            </div>
                            <div className="ml-6">
                                <input
                                    type="file"
                                    id="xbrl-upload"
                                    onChange={handleXbrlUpload}
                                    accept=".xml,.xbrl,.zip"
                                    className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Display */}
                    {loading && (
                        <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded">
                            Processing...
                        </div>
                    )}

                    {(!loading && uploadStatus.type !== 'none') && (
                        <div className="mt-2 p-2 bg-green-50 text-green-700 rounded flex items-center gap-2">
                            <div className="font-medium">Using:</div>
                            {uploadStatus.type === 'preloaded' ? 'Preloaded Mockup File' : uploadStatus.filename}
                        </div>
                    )}
                </CardContent>
            </Card>

            {jsonFiling && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>Filing JSON Data</span>
                            <Button
                                onClick={handleDownloadJson}
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download JSON</span>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto max-h-[600px]">
                        <JsonView data={jsonFiling} style={defaultStyles} />
                    </CardContent>
                </Card>
            )}
        </>
    );
}
