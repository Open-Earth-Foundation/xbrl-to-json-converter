
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";

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
                    Uploads an XBRL file for processing. Returns a unique identifier for tracking the file's analysis status.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">WebSocket Connection</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>WS /ws/{"<user_id>"}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Establishes a WebSocket connection for real-time chat with the AI assistant. The user_id is obtained from the upload response.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">API Usage Example</h4>
                  <div className="bg-gray-700 text-white p-3 rounded text-sm font-mono">
                    <pre>{`// Example JavaScript code for file upload
const formData = new FormData();
formData.append('file', xbrlFile);

fetch('/upload_file', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  const userId = data.user_id;
  const socket = new WebSocket(\`ws://your-domain.com/ws/\${userId}\`);
  
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
  };
  
// fetch the file from the returned url
});`}</pre>
                  </div>
                </div>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
