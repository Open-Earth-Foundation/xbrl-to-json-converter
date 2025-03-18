import React, {useEffect, useState} from 'react';
import CorporateFilingUpload from "@/components/CorporateFilingUpload"; // Updated import
import Documentation from "../components/Documentation";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Hero from "@/components/Hero";
import {BookOpen, FileUp} from "lucide-react";

function Home() {
    const [activeTab, setActiveTab] = useState('convert');

    // Listen for tab change requests
    useEffect(() => {
        const handleTabSwitch = (event: CustomEvent) => {
            if (event.detail?.tab) {
                setActiveTab(event.detail.tab);
            }
        };

        // Check localStorage for active tab on mount
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            setActiveTab(savedTab);
            localStorage.removeItem('activeTab'); // Clear after use
        }

        // Add event listener for custom event
        window.addEventListener('switchTab', handleTabSwitch as EventListener);

        return () => {
            window.removeEventListener('switchTab', handleTabSwitch as EventListener);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Hero/>
            <main className="flex-1 container mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-6 bg-muted rounded-lg">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="convert">
                            <FileUp className="h-4 w-4 mr-1"/>
                            Convert</TabsTrigger>

                        <TabsTrigger value="docs">
                            <BookOpen className="h-4 w-4 mr-1"/>
                            Documentation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="convert" className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <CorporateFilingUpload/>
                        </div>
                    </TabsContent>
                    <TabsContent value="docs">
                        <Documentation/>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default Home;