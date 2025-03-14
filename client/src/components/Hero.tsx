import React from "react";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  // Force scroll to top when Hero component mounts
  // Use a stronger approach to ensure we really stay at the top
  React.useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0);
    
    // Also do a delayed scroll to handle any race conditions
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 h-[80vh] min-h-[600px] flex items-center relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 mb-3 border border-white rounded-full text-xs font-medium text-white">
            Beta Version
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans">
            XBRL to JSON converter
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Convert your ESRS filings to JSON
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={scrollToContent}
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Explore an ESRS Filing
            </Button>
            <Button 
              onClick={() => {
                // First scroll to content
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth'
                });
                
                // Use localStorage to signal tab change
                localStorage.setItem('activeTab', 'about');
                
                // Dispatch a custom event that Home component will listen for
                const event = new CustomEvent('switchTab', { detail: { tab: 'about' } });
                window.dispatchEvent(event);
              }}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/20"
            >
              Why it's important for Climate Action
            </Button>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white hover:text-white/80"
        onClick={scrollToContent}
      >
        <ArrowDown className="h-8 w-8 animate-bounce" />
      </Button>
    </section>
  );
}