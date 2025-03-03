import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, FileSearch, ClipboardCheck, MessageSquare, Code2, BookOpen } from "lucide-react";
import EducationModal from "./EducationModal";

const cards = [
  {
    icon: <FileSearch className="h-8 w-8" />,
    title: "Explore ESRS Filings",
    description: "Learn about company ESG details and sustainability reporting",
    modalContent: "Dive deep into company Environmental, Social, and Governance (ESG) reporting through their ESRS filings. Understand how companies report their sustainability initiatives, environmental impact, social responsibility measures, and governance practices. Our tool helps you navigate through complex ESRS documents with ease, making sustainability data more accessible and comprehensible."
  },
  {
    icon: <ClipboardCheck className="h-8 w-8" />,
    title: "Understand ESRS Standard",
    description: "Navigate through different sections of ESRS filings",
    modalContent: "Master the European Sustainability Reporting Standards (ESRS) framework. Learn about different disclosure requirements including environmental standards (E1-E5), social standards (S1-S4), and governance standards (G1-G2). Understand how these standards shape corporate sustainability reporting and what information companies must disclose in each section."
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Natural Language Chat",
    description: "Chat directly with filings and standards documentation",
    modalContent: "Interact with ESRS filings and standards documentation using natural language queries. Ask questions about specific disclosures, get clarification on reporting requirements, or explore sustainability metrics. Our AI-powered chat interface makes it easy to find and understand the information you need without navigating complex technical documents."
  },
  {
    icon: <Code2 className="h-8 w-8" />,
    title: "Open Source & API",
    description: "Build and extend using our open tools and API",
    modalContent: "Access our open-source tools and comprehensive API to build your own applications and extensions. Integrate ESRS data analysis into your workflows, create custom visualizations, or develop new features on top of our platform. Our well-documented API enables programmatic access to ESRS filings and analysis tools."
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "ESRS & XBRL Guide",
    description: "Introduction to sustainability reporting standards",
    modalContent: "Get started with ESRS (European Sustainability Reporting Standards) and XBRL (eXtensible Business Reporting Language). Learn how these frameworks work together to standardize sustainability reporting, making it machine-readable and comparable across companies. Understand the importance of structured data in modern corporate reporting and how it enables better analysis of sustainability information."
  }
];

export default function CardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="relative py-16 px-6">
      <div className="flex items-center justify-center gap-6 overflow-hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="hidden md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory p-3 no-scrollbar">
          {cards.map((card, index) => (
            <Card
              key={index}
              className={`min-w-[250px] md:min-w-[300px] cursor-pointer transition-transform duration-200 hover:scale-105 snap-center
                ${index === currentIndex ? 'ring-2 ring-blue-700 shadow-lg' : ''}`}
              onClick={() => setSelectedCard(index)}
            >
              <CardContent className="p-6">
                <div className="mb-4 text-blue-700">{card.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="hidden md:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <EducationModal
        isOpen={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        content={selectedCard !== null ? cards[selectedCard] : null}
      />
    </div>
  );
}