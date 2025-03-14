
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
              <h3 className="text-xl font-semibold mb-3">The XBRL to JSON converter</h3>
              <p className="text-gray-600 mb-4">
                To make the process of analyzing sustainability disclosures easier and more effective, we built the <span className="font-bold">XBRL to JSON converter</span>.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-2">XBRL File Processing</h4>
                  <p className="text-gray-700">
                    The tool is capable of parsing complex XBRL files and converting them to JSON format. This is especially useful for ESRS filings, which require detailed analysis to understand a company's climate impact.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3">Technical Overview</h3>
              <p className="text-gray-600 mb-4">
                For developers and technical stakeholders, the XBRL to JSON converter is built with a modern tech stack:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-blue-600 font-medium">Frontend</div>
                  <div className="text-sm text-gray-500">React & TypeScript</div>
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
              <h3 className="text-xl font-semibold mb-3">Further Work & Collaboration</h3>
              <p className="text-gray-600 mb-4">
                The XBRL Disclosure Explorer is an open source project designed to catalyze corporate climate action through improved transparency and data accessibility. We're just getting started, and we invite you to join us in developing this toolset further.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">How You Can Contribute</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Build additional reporting and visualization tools using our Open API</li>
                  <li>Help improve our XBRL parser to handle more complex sustainability filings</li>
                  <li>Develop sector-specific analysis modules for different industries</li>
                  <li>Create educational resources to help stakeholders interpret ESRS data</li>
                </ul>
              </div>
              
              <p className="text-gray-600">
                By leveraging this open source foundation, together we can build a more robust ecosystem of tools for tracking corporate climate progress, holding companies accountable, and accelerating the transition to a sustainable economy.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
