import { Card, CardContent } from "./ui/card";
import { FileJson, Upload, Clock, FileCheck, Terminal, Info } from "lucide-react";

export default function Documentation() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <FileJson className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            XBRL to JSON Converter
                        </h2>
                    </div>

                    {/* Why It Matters */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="h-6 w-6 text-primary" />
                            <h3 className="text-2xl font-semibold">Why It Matters</h3>
                        </div>
                        <Card className="border border-muted-foreground/20">
                            <CardContent className="p-6">
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p>
                                        This software was developed to make XBRL (eXtensible Business Reporting Language) files 
                                        more accessible, particularly for climate documentation and financial reports. While XBRL 
                                        is a powerful standard, it presents several challenges:
                                    </p>
                                    
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Complex structure that's difficult to understand and process</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Limited open-source software support (primarily only Arelle)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Challenging to integrate with modern data analysis tools</span>
                                        </li>
                                    </ul>

                                    <p>
                                        Our solution transforms XBRL .zip filings into a simplified JSON structure that:
                                    </p>

                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Is compatible with numerous open-source software tools</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Can be easily processed by AI and machine learning systems</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Simplifies data interpretation and analysis</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>Makes financial and climate reporting more accessible to developers and analysts</span>
                                        </li>
                                    </ul>

                                    <p>
                                        By providing this API, we aim to break down the barriers to working with XBRL data, 
                                        enabling better analysis and understanding of both financial and climate-related disclosures.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Introduction */}
                    <div className="mb-8 bg-muted/30 p-6 rounded-lg">
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            This service provides a REST API for converting XBRL (eXtensible Business Reporting Language) 
                            files to JSON format using the Arelle framework. Built with performance and reliability in mind.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* API Reference */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="h-6 w-6 text-primary" />
                                <h3 className="text-2xl font-semibold">API Reference</h3>
                            </div>

                            <Card className="border border-muted-foreground/20">
                                <CardContent className="p-6">
                                    <h4 className="text-xl font-medium text-primary mb-4">XBRL Upload Endpoint</h4>
                                    <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm mb-4">
                                        <p className="text-primary font-bold">POST /upload_file</p>
                                        <p className="text-muted-foreground">Content-Type: multipart/form-data</p>
                                        <div className="mt-3">
                                            <p className="font-medium">Body Parameters:</p>
                                            <ul className="ml-4 space-y-2 mt-2">
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary">•</span>
                                                    <code className="bg-muted px-2 py-1 rounded">file</code>
                                                    <span>File (required) - XBRL file to convert</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary">•</span>
                                                    <code className="bg-muted px-2 py-1 rounded">websocket_user_id</code>
                                                    <span>String (required) - Unique identifier for the upload session</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="font-medium text-lg mb-2">Success Response</h5>
                                            <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm">
                                                <p className="text-green-600 font-bold">200 OK</p>
                                                <pre className="mt-2 text-muted-foreground">{`{
    "message": "XBRL File uploaded & converted successfully",
    "json_data": { ... } // Converted JSON content
}`}</pre>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-lg mb-2">Error Responses</h5>
                                            <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm">
                                                <p className="text-red-500">400 Bad Request - Invalid file format</p>
                                                <p className="text-red-500">500 Internal Server Error - Conversion failed</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* File Format Requirements */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <FileCheck className="h-6 w-6 text-primary" />
                                <h3 className="text-2xl font-semibold">File Requirements</h3>
                            </div>
                            <Card className="border border-muted-foreground/20">
                                <CardContent className="p-6">
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Accepted file formats: <code className="bg-muted px-2 py-1 rounded">.zip</code></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Maximum file size: <code className="bg-muted px-2 py-1 rounded">10MB</code></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Files must be valid XBRL documents</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Rate Limits */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="h-6 w-6 text-primary" />
                                <h3 className="text-2xl font-semibold">Rate Limits</h3>
                            </div>
                            <Card className="border border-muted-foreground/20">
                                <CardContent className="p-6">
                                    <p className="text-muted-foreground mb-4">
                                        To ensure service stability, the following limits apply:
                                    </p>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Maximum <code className="bg-muted px-2 py-1 rounded">100</code> requests per hour per IP</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Maximum <code className="bg-muted px-2 py-1 rounded">5</code> concurrent uploads per user</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Example Usage */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Terminal className="h-6 w-6 text-primary" />
                                <h3 className="text-2xl font-semibold">Example Usage</h3>
                            </div>
                            <Card className="border border-muted-foreground/20">
                                <CardContent className="p-6">
                                    <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm mb-4">
                                        <div className="mb-4">
                                            <p className="text-primary font-bold mb-2"># Windows (with SSL certificate verification bypass)</p>
                                            <pre className="text-muted-foreground whitespace-pre-wrap">{`curl -X POST https://xbrl-to-json-backend.openearth.dev/upload_file \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@your_file.zip;type=application/x-zip-compressed" \\
  -F "websocket_user_id=user123" \\
  --insecure \\
  -o "your_file_converted.json"`}</pre>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-primary font-bold mb-2"># Linux/macOS</p>
                                            <pre className="text-muted-foreground whitespace-pre-wrap">{`curl -X POST https://xbrl-to-json-backend.openearth.dev/upload_file \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@your_file.zip;type=application/x-zip-compressed" \\
  -F "websocket_user_id=user123" \\
  -o "your_file_converted.json"`}</pre>
                                        </div>
                                        <div>
                                            <p className="text-primary font-bold mb-2"># Example with actual file</p>
                                            <pre className="text-muted-foreground whitespace-pre-wrap">{`curl -X POST https://xbrl-to-json-backend.openearth.dev/upload_file \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@apple.zip;type=application/x-zip-compressed" \\
  -F "websocket_user_id=user123" \\
  -o "apple_converted.json"`}</pre>
                                        </div>
                                    </div>
                                    <div className="bg-muted/20 p-4 rounded-lg">
                                        <h5 className="font-medium text-lg mb-2">Important Notes:</h5>
                                        <ul className="space-y-2 text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Replace <code className="bg-muted px-2 py-0.5 rounded">your_file.zip</code> with your actual XBRL zip file path</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>The <code className="bg-muted px-2 py-0.5 rounded">-o</code> flag specifies the output file name for the converted JSON</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>The <code className="bg-muted px-2 py-0.5 rounded">--insecure</code> flag is only needed on Windows if you encounter SSL certificate verification issues</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Make sure your zip file contains valid XBRL documents</span>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
