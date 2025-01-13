import { Card, CardContent } from "./ui/card";

export default function About() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">About XBRL Disclosure Explorer</h2>
          <p className="text-gray-600 mb-4">
            The XBRL Disclosure Explorer is a cutting-edge platform designed to revolutionize how organizations interact with European Sustainability Reporting Standards (ESRS) filings. Our tool makes sustainability reporting data more accessible, understandable, and actionable.
          </p>
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To democratize access to sustainability reporting data and empower organizations to make informed decisions about their environmental, social, and governance practices.
              </p>
            </section>
            <section>
              <h3 className="text-xl font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Advanced XBRL Processing</li>
                <li>Real-time Data Analysis</li>
                <li>Interactive Visualization Tools</li>
                <li>Natural Language Processing</li>
                <li>API Integration Capabilities</li>
              </ul>
            </section>
            <section>
              <h3 className="text-xl font-semibold mb-2">Technology Stack</h3>
              <p className="text-gray-600">
                Built with modern technologies including React, Flask, WebSocket for real-time processing, and advanced XBRL parsing capabilities. Our platform ensures high performance, reliability, and scalability.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
