import React, { useState } from 'react';
import CardCarousel from "../components/CardCarousel";
import FileUpload from "../components/FileUpload";
import Chat from "../components/Chat";
import About from "../components/About";
import Documentation from "../components/Documentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Hero from "../components/Hero";

function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="w-full p-6 bg-muted rounded-lg">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="about" data-value="about">About</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <CardCarousel />
            <FileUpload />
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