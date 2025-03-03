
import { Card, CardContent } from "./ui/card";

export default function About() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Analyzing Corporate Filings for Climate Action</h2>
          <p className="text-gray-600 mb-6">
            Climate change is one of the most pressing challenges of our time, and transparency in corporate sustainability practices is essential. Analyzing and tracking corporate filings, such as those under the European Sustainability Reporting Standards (ESRS), helps ensure that companies stick to their climate goals, show real progress, and do their fair share in addressing environmental challenges.
          </p>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">Why Corporate Filings Matter</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-800">Accountability and Transparency</h4>
                  <p className="text-gray-700">
                    Corporate filings provide insight into how companies are managing their environmental, social, and governance (ESG) responsibilities. Regular analysis of these documents makes it possible to hold companies accountable for their commitments.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-medium text-green-800">Progress Monitoring</h4>
                  <p className="text-gray-700">
                    Tracking these filings allows stakeholders—including investors, regulators, and the public—to evaluate whether companies are making measurable progress toward their climate targets. It helps identify leaders and laggards in sustainability.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800">Informed Decision-Making</h4>
                  <p className="text-gray-700">
                    Detailed analysis of sustainability disclosures empowers decision-makers to support businesses that are genuinely committed to climate action and to push those that are falling short.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3">The ESRS Analysis Tool: Revolutionizing Sustainability Reporting</h3>
              <p className="text-gray-600 mb-4">
                To make the process of analyzing sustainability disclosures easier and more effective, we built the <span className="font-bold">XBRL Disclosure Explorer</span>. This interactive platform leverages state-of-the-art technologies, including advanced XBRL processing and AI-powered insights, to transform raw corporate data into actionable information.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-2">XBRL File Processing</h4>
                  <p className="text-gray-700">
                    The tool is capable of parsing complex XBRL files to extract relevant sustainability data. This is especially crucial for ESRS filings, which require detailed analysis to understand a company's climate impact.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-2">AI-Powered Chat Interface</h4>
                  <p className="text-gray-700">
                    Users can interact with the tool through a chatbot, asking natural language questions to quickly access insights derived from the data. This conversational interface makes sustainability data more accessible to a broader audience.
                  </p>
                </div>
                
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-2">ESRS Embedded Knowledge</h4>
                  <p className="text-gray-700">
                    The platform includes embedded ESRS knowledge that helps users navigate and understand the taxonomy, different sections, and requirements of the standards without needing to reference external documentation.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Open API</h4>
                  <p className="text-gray-700">
                    Our Open API enables developers to flatten XBRL files into JSON format that can be easily parsed by LLMs for analysis and used to build other climate action solutions and integrations.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3">Technical Overview</h3>
              <p className="text-gray-600 mb-4">
                For developers and technical stakeholders, the ESRS Analysis Tool is built with a modern tech stack:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3">Conclusion</h3>
              <p className="text-gray-600">
                By making sustainability data accessible and actionable, our ESRS Analysis Tool is empowering stakeholders to drive meaningful change. As corporations work towards meeting their climate commitments, tools like this are essential for monitoring progress, ensuring accountability, and ultimately accelerating the transition to a sustainable future.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
