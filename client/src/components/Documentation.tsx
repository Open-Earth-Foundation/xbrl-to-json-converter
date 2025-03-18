import {Card, CardContent} from "./ui/card";

export default function Documentation() {
    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">XBRL Disclosure Explorer Documentation</h2>
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-3">API Reference</h3>

                        <div className="bg-white p-4 rounded-lg shadow mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">XBRL Upload Endpoint</h4>
                            <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                                <p>POST /upload_file</p>
                                <p>Content-Type: multipart/form-data</p>
                                <p>Body: file</p>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Uploads an <a href="https://www.xbrl.org/the-standard/what/"
                                              className="text-blue-500 underline">XBRL file</a> for processing. Returns
                                the json result.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
