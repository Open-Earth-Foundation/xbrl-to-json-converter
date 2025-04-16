import React, { useEffect, useState } from 'react';
import CorporateFilingUpload from '@/components/CorporateFilingUpload';
import Documentation from '../components/Documentation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Hero from '@/components/Hero';
import { BookOpen, FileUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function Home() {
    const [activeTab, setActiveTab] = useState('convert');

    useEffect(() => {
        const handleTabSwitch = (event: CustomEvent) => {
            if (event.detail?.tab) {
                setActiveTab(event.detail.tab);
            }
        };

        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            setActiveTab(savedTab);
            localStorage.removeItem('activeTab');
        }

        window.addEventListener('switchTab', handleTabSwitch as EventListener);

        return () => {
            window.removeEventListener('switchTab', handleTabSwitch as EventListener);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Hero />
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Introduction Section */}
                <Card className="mb-8 border-none shadow-lg">
                    <CardContent className="p-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent mb-3">
                                Simplifying XBRL for Everyone
                            </h2>
                            <p className="text-lg text-muted-foreground mb-4">
                                XBRL (eXtensible Business Reporting Language) files are crucial for financial and climate reporting but notoriously complex to open, interpret, and utilize effectively. This complexity poses significant challenges for analysts, developers, and AI-driven tools.
                            </p>
                            <p className="text-lg text-muted-foreground mb-4">
                                Our software addresses these hurdles by converting .zip XBRL filings into a straightforward JSON format. JSON files offer a simpler, universally accessible structure compatible with a wide range of open-source software, significantly enhancing their readability and usability, especially for AI-driven analytics and interpretations.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                By transforming complex XBRL data into easily manageable JSON, we empower users to unlock deeper insights efficiently and accurately.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-muted/30 p-6 rounded-lg border border-primary/10">
                                <h3 className="font-semibold text-primary mb-3">Current Challenges</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Complex and nested XBRL structures</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Limited OSS support (primarily Arelle)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Difficult integration with modern analytical tools</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-lg border border-primary/10">
                                <h3 className="font-semibold text-primary mb-3">Our Solution</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Conversion to clean and intuitive JSON format</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Easily integratable with modern software and AI models</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Enhanced accessibility and clarity for deeper insights</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-6 bg-muted rounded-lg">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="convert">
                            <FileUp className="h-4 w-4 mr-1" /> Convert
                        </TabsTrigger>

                        <TabsTrigger value="docs">
                            <BookOpen className="h-4 w-4 mr-1" /> Documentation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="convert" className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <CorporateFilingUpload />
                        </div>
                    </TabsContent>

                    <TabsContent value="docs">
                        <Documentation />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default Home;
