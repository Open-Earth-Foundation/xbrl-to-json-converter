import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";

export default function Hero() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans">
            XBRL Disclosure Explorer for ESRS
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Navigate and analyze ESRS filings with AI assistance. Upload your XBRL documents for instant insights and compliance verification.
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
                // Then set a timeout to select the About tab after scrolling
                setTimeout(() => {
                  // Directly set the value of the Tabs component to "about"
                  const tabsElement = document.querySelector('[role="tablist"]')?.parentElement;
                  if (tabsElement) {
                    // Find and dispatch a click on the about tab trigger 
                    const aboutTab = document.querySelector('[value="about"][role="tab"]') as HTMLElement;
                    if (aboutTab) {
                      aboutTab.click();
                    }
                  }
                }, 600);
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