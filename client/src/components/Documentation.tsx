
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
                  The XBRL Disclosure Explorer is an interactive tool for analyzing and exploring European Sustainability Reporting Standards (ESRS) documents using AI assistance. This platform helps stakeholders navigate complex corporate sustainability filings to promote transparency and accountability in climate reporting.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-6">
                  <h4 className="font-medium text-blue-800">Why It Matters</h4>
                  <p className="text-gray-700">
                    Tracking corporate sustainability filings allows stakeholders to evaluate whether companies are making measurable progress toward their climate targets. This tool makes it easier to identify trends, compare reporting across companies, and ensure compliance with ESRS requirements.
                  </p>
                </div>
                
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
                <ul className="list-disc pl-5 space-y-1 text-gray-600 mb-6">
                  <li>XBRL files that comply with ESRS standards</li>
                  <li>Modern web browser for optimal experience</li>
                </ul>
                
                <h4 className="font-semibold text-lg mb-2">Quick Start</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600 mb-6">
                  <li>Visit the upload section from the main interface</li>
                  <li>Upload your XBRL or pre-converted JSON file</li>
                  <li>Wait for processing to complete</li>
                  <li>Use the chat interface to start exploring your data</li>
                </ol>
                
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6">
                  <h4 className="font-medium text-green-800">Sample Queries</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>"What climate targets has the company disclosed?"</li>
                    <li>"Summarize the sustainability risks mentioned in this filing"</li>
                    <li>"Show me all environmental metrics with their values"</li>
                    <li>"Compare this company's emissions to industry averages"</li>
                  </ul>
                </div>
                
                <h4 className="font-semibold text-lg mb-2">System Modes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <h4 className="font-medium text-gray-900 mb-2">AI-Powered Chat Interface</h4>
                    <p className="text-gray-700">
                      Interact with your data through a natural language interface that understands ESRS context.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">ESRS Embedded Knowledge</h4>
                    <p className="text-gray-700">
                      The platform includes embedded ESRS knowledge that helps users navigate and understand the taxonomy, different sections, and requirements of the standards.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">Open API</h4>
                    <p className="text-gray-700">
                      Our Open API enables developers to flatten XBRL files into JSON format that can be easily parsed by LLMs and used to build other climate action solutions.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">Using the Tool</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>Upload your XBRL or JSON file through the upload interface.</li>
                  <li>Wait for the system to process and analyze your file.</li>
                  <li>Use the chat interface to ask questions about the data in natural language.</li>
                  <li>Switch between different modes to access either preloaded knowledge or file-specific analysis.</li>
                </ol>
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
                <div className="space-y-3 mb-6">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900">FastAPI Backend</h5>
                    <p className="text-gray-600 text-sm">
                      Handles WebSocket connections, manages user sessions, and coordinates between the AI assistant and file processing services.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900">Arelle Service</h5>
                    <p className="text-gray-600 text-sm">
                      Specialized microservice for processing XBRL files and converting them to a more accessible JSON format.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900">React Frontend</h5>
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
                    <p>Body: file, websocket_user_id</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Uploads an XBRL file, converts it to JSON using Arelle, and makes it available for querying.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">JSON Upload Endpoint</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>POST /upload_json_file</p>
                    <p>Content-Type: multipart/form-data</p>
                    <p>Body: file, websocket_user_id</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Uploads a JSON file directly for analysis without XBRL conversion.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">WebSocket Endpoint</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>WS /ws?user_id=&#123;userId&#125;</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Establishes a WebSocket connection for real-time chat interaction with the AI assistant.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Switch Mode Endpoint</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>POST /switch_mode</p>
                    <p>Content-Type: application/x-www-form-urlencoded</p>
                    <p>Body: websocket_user_id, new_mode</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Switches between different assistant modes: preloaded, user_json, or converted_xbrl.
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">API Documentation</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Full API documentation is available at:
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-600">
                    <li>Backend API: <span className="font-mono">http://localhost:8000/docs</span></li>
                    <li>Arelle Service: <span className="font-mono">http://localhost:8001/docs</span></li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
