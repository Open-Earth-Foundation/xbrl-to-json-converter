
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";

export default function Documentation() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">XBRL Disclosure Explorer Documentation</h2>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="prose text-gray-600 max-w-none">
                <p className="mb-4">
                  The XBRL Disclosure Explorer is an interactive tool for analyzing European Sustainability Reporting Standards (ESRS) documents using AI assistance. This documentation will guide you through the platform's features and usage.
                </p>
                
                <h4 className="font-semibold text-lg mb-2">Key Components</h4>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>XBRL file processing and conversion to accessible JSON format</li>
                  <li>Natural language query interface for document exploration</li>
                  <li>Built-in knowledge about ESRS requirements and taxonomy</li>
                  <li>Real-time analysis and insights generation</li>
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">Project Status</h4>
                  <p>This is an open source project in active development. Contributions are welcome!</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="getting-started">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
                
                <h4 className="font-semibold text-lg mb-2">Prerequisites</h4>
                <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-600">
                  <li>A modern web browser (Chrome, Firefox, Safari, or Edge recommended)</li>
                  <li>XBRL files in ESRS format for analysis (optional)</li>
                </ul>
                
                <h4 className="font-semibold text-lg mb-2">Usage Instructions</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                  <li>Upload your XBRL or JSON file through the upload interface.</li>
                  <li>Wait for the system to process and analyze your file.</li>
                  <li>Use the chat interface to ask questions about the data in natural language.</li>
                  <li>Switch between different modes to access either preloaded knowledge or file-specific analysis.</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="features">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">XBRL File Processing</h4>
                    <p className="text-gray-700">
                      Upload complex XBRL files and convert them into a structured JSON format for easy analysis.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">AI-Powered Analysis</h4>
                    <p className="text-gray-700">
                      Leverage natural language processing to extract insights from sustainability reporting data.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">Conversational Interface</h4>
                    <p className="text-gray-700">
                      Ask questions and receive answers about ESRS filings in natural language through the chat interface.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">Open API</h4>
                    <p className="text-gray-700">
                      Access programmatic interfaces to build your own applications on top of our XBRL processing capabilities.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-semibold text-lg mb-2">Operation Modes</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="font-medium text-gray-900 mb-2">Preloaded Mode</h5>
                    <p className="text-gray-700 text-sm">
                      Access general information about ESRS standards and taxonomy without uploading files.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="font-medium text-gray-900 mb-2">User Upload Mode</h5>
                    <p className="text-gray-700 text-sm">
                      Upload and analyze your own XBRL or JSON files for specific company insights.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="architecture">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-3">Technical Architecture</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-blue-600 font-medium">Frontend</div>
                    <div className="text-sm text-gray-500">React & TypeScript</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-blue-600 font-medium">Backend</div>
                    <div className="text-sm text-gray-500">FastAPI</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-blue-600 font-medium">XBRL Processing</div>
                    <div className="text-sm text-gray-500">Arelle Service</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-blue-600 font-medium">Communication</div>
                    <div className="text-sm text-gray-500">WebSockets</div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-lg mb-2">System Components</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="font-medium text-gray-900 mb-2">XBRL Service</h5>
                    <p className="text-gray-600 text-sm">
                      Converts XBRL documents into structured JSON format using Arelle framework.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="font-medium text-gray-900 mb-2">Backend API</h5>
                    <p className="text-gray-600 text-sm">
                      Handles file uploads, data processing, and WebSocket connections for real-time communication.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="font-medium text-gray-900 mb-2">Frontend App</h5>
                    <p className="text-gray-600 text-sm">
                      Provides an intuitive user interface with file upload capabilities, chat interface, and document visualization.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-semibold text-lg mb-2">Data Flow</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                  <li>User uploads XBRL file through the frontend</li>
                  <li>Backend forwards the file to Arelle Service for conversion</li>
                  <li>Converted JSON is processed and indexed for AI analysis</li>
                  <li>User interacts with the data via WebSocket-powered chat interface</li>
                  <li>AI assistant processes queries and returns relevant information</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="api">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-3">API Reference</h3>
                
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">XBRL Upload Endpoint</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>POST /upload</p>
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
                    <p>WS /ws/{user_id}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Establishes a WebSocket connection for real-time chat with the AI assistant. The user_id is obtained from the upload response.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">JSON Export Endpoint</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>GET /export/{file_id}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Retrieves the processed JSON data for a specific file by its ID.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">API Usage Example</h4>
                  <div className="bg-gray-700 text-white p-3 rounded text-sm font-mono">
                    <pre>{`// Example JavaScript code for file upload
const formData = new FormData();
formData.append('file', xbrlFile);

fetch('/upload', {
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
  
  socket.onopen = () => {
    socket.send(JSON.stringify({
      message: 'What are the company's climate targets?'
    }));
  };
});`}</pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
