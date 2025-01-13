import { Card, CardContent } from "./ui/card";

export default function Documentation() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Documentation</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
              <div className="prose text-gray-600">
                <p>Welcome to the XBRL Disclosure Explorer documentation. This guide will help you understand how to use our platform effectively.</p>
                
                <h4 className="text-lg font-medium mt-4 mb-2">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Upload your XBRL file or use our mockup filing</li>
                  <li>Navigate through the interactive visualization</li>
                  <li>Use the chat interface to query your data</li>
                  <li>Export results in various formats</li>
                </ol>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">ESRS Standards</h3>
              <div className="prose text-gray-600">
                <p>The European Sustainability Reporting Standards (ESRS) are structured into three main categories:</p>
                
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Environmental Standards (E1-E5)</li>
                  <li>Social Standards (S1-S4)</li>
                  <li>Governance Standards (G1-G2)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">API Reference</h3>
              <div className="prose text-gray-600">
                <p>Our REST API enables programmatic access to all platform features. Authentication is required for API access.</p>
                
                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  <code>GET /api/v1/filings</code>
                  <p className="mt-2">Retrieve a list of all available ESRS filings</p>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
