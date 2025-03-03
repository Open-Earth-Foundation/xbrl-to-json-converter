
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
                    Climate change is one of the most pressing challenges of our time. By making sustainability data accessible and actionable, our tool empowers stakeholders to hold companies accountable for their environmental commitments and drive meaningful climate action.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="getting-started">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Installation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">Backend Setup</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                      <p>cd backend</p>
                      <p>pip install -r requirements.txt</p>
                      <p>uvicorn app:app --reload --port 8000</p>
                    </div>
                    <p className="text-gray-600 text-sm">Starts the FastAPI backend server for WebSocket communication and file processing.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">Arelle Service Setup</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                      <p>cd arelle_service</p>
                      <p>pip install -r requirements.txt</p>
                      <p>uvicorn app:app --reload --port 8001</p>
                    </div>
                    <p className="text-gray-600 text-sm">Starts the XBRL processing service that converts XBRL files to JSON.</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Frontend Setup</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-2">
                    <p>cd client</p>
                    <p>npm install</p>
                    <p>npm run dev</p>
                  </div>
                  <p className="text-gray-600 text-sm">Starts the React frontend on http://localhost:5173</p>
                </div>
                
                <h3 className="text-xl font-semibold">Configuration</h3>
                <p className="text-gray-600 mb-4">
                  Copy the example environment files and configure your settings:
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-4">
                  <p>cp backend/.env.example backend/.env</p>
                  <p>cp client/.env.example client/.env</p>
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
                      Upload and parse complex XBRL files to extract relevant sustainability data. Our Arelle-powered service converts XBRL into JSON format for easier analysis.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">AI-Powered Chat Interface</h4>
                    <p className="text-gray-700">
                      Interact with the data through a natural language chatbot interface. Ask questions about the filing to get instant insights without needing technical expertise.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-900 mb-2">ESRS Embedded Knowledge</h4>
                    <p className="text-gray-700">
                      The platform includes embedded ESRS knowledge to help users navigate the complex taxonomy and different sections of the standards.
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
                      A dedicated microservice for converting XBRL files to JSON format using the Arelle library.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900">Query API Service</h5>
                    <p className="text-gray-600 text-sm">
                      Provides endpoints for querying ESRS documentation and reference materials.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900">React Frontend</h5>
                    <p className="text-gray-600 text-sm">
                      Modern UI with real-time WebSocket communication for file uploads and chat interactions.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-semibold text-lg mb-2">Data Flow</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>User uploads an XBRL file to the backend</li>
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
                    <p>WS /ws?user_id={user_id}</p>
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
