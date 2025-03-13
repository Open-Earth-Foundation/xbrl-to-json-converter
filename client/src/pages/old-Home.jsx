import React, { useState, useEffect, useRef } from "react";
import CardCarousel from "../components/CardCarousel";
import CorporateFilingUpload from "@/components/CorporateFilingUpload";
import Chat from "../components/Chat";
import About from "../components/About";
import Documentation from "../components/Documentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Hero from "../components/Hero";
import { MessageSquare, Info, BookOpen } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Listen for tab switch events
    const handleTabSwitch = (event) => {
      setActiveTab(event.detail.tab);
      // Only scroll when explicitly switching tabs, not on initial load
      if (!initialLoadRef.current) {
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('switchTab', handleTabSwitch);

    // Check localStorage for active tab on load
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      setActiveTab(storedTab);
      localStorage.removeItem('activeTab'); // Clear after using
      // Don't auto-scroll on initial load even if tab is stored
    }

    // Set initialLoad to false after first render
    initialLoadRef.current = false;

    return () => {
      window.removeEventListener('switchTab', handleTabSwitch);
    };
  }, []);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="h-4 w-4 mr-1 text-blue-500" />
            About
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <BookOpen className="h-4 w-4 mr-1 text-blue-500" />
            Documentation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Hero />
          <CardCarousel />
          <CorporateFilingUpload />
        </TabsContent>
        <TabsContent value="chat">
          <Chat />
        </TabsContent>
        <TabsContent value="about">
          <About />
        </TabsContent>
        <TabsContent value="documentation">
          <Documentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}