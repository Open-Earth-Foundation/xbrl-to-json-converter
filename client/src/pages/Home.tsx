import React, { useState, useEffect } from 'react';
import CardCarousel from "../components/CardCarousel";
import CorporateFilingUpload from "@/components/CorporateFilingUpload"; // Updated import
import Chat from "../components/Chat";
import About from "../components/About";
import Documentation from "../components/Documentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Hero from "../components/Hero";

function Home() {
  const [activeTab, setActiveTab] = useState('chat');

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
      <Hero />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-6 bg-muted rounded-lg">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="about" data-value="about">About</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <CardCarousel />
            <div className="flex flex-col gap-4"> {/*Replaced FileUpload with CorporateFilingUpload*/}
              <CorporateFilingUpload />
            </div>
            <Chat />
          </TabsContent>

          <TabsContent value="about">
            <About />
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