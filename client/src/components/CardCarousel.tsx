import {useState} from "react";
import {Card, CardContent} from "./ui/card";
import {BookOpen, ClipboardCheck, Code2, FileSearch, MessageSquare} from "lucide-react";
import EducationModal from "./EducationModal";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "./ui/carousel"

interface Card {
    icon: any;
    title: string;
    description: string;
    modalContent: string;

}

const cards: Card[] = [
    {
        icon: <FileSearch className="h-8 w-8"/>,
        title: "Explore ESRS Filings",
        description: "Learn about company ESG details and sustainability reporting",
        modalContent: "Dive deep into company Environmental, Social, and Governance (ESG) reporting through their ESRS filings. Understand how companies report their sustainability initiatives, environmental impact, social responsibility measures, and governance practices. Our tool helps you navigate through complex ESRS documents with ease, making sustainability data more accessible and comprehensible."
    },
    {
        icon: <ClipboardCheck className="h-8 w-8"/>,
        title: "Understand ESRS Standard",
        description: "Navigate through different sections of ESRS filings",
        modalContent: "Master the European Sustainability Reporting Standards (ESRS) framework. Learn about different disclosure requirements including environmental standards (E1-E5), social standards (S1-S4), and governance standards (G1-G2). Understand how these standards shape corporate sustainability reporting and what information companies must disclose in each section."
    },
    {
        icon: <MessageSquare className="h-8 w-8"/>,
        title: "Natural Language Chat",
        description: "Chat directly with filings and standards documentation",
        modalContent: "Interact with ESRS filings and standards documentation using natural language queries. Ask questions about specific disclosures, get clarification on reporting requirements, or explore sustainability metrics. Our AI-powered chat interface makes it easy to find and understand the information you need without navigating complex technical documents."
    },
    {
        icon: <Code2 className="h-8 w-8"/>,
        title: "Open Source & API",
        description: "Build and extend using our open tools and API",
        modalContent: "Access our open-source tools and comprehensive API to build your own applications and extensions. Integrate ESRS data analysis into your workflows, create custom visualizations, or develop new features on top of our platform. Our well-documented API enables programmatic access to ESRS filings and analysis tools."
    },
    {
        icon: <BookOpen className="h-8 w-8"/>,
        title: "ESRS & XBRL Guide",
        description: "Introduction to sustainability reporting standards",
        modalContent: "Get started with ESRS (European Sustainability Reporting Standards) and XBRL (eXtensible Business Reporting Language). Learn how these frameworks work together to standardize sustainability reporting, making it machine-readable and comparable across companies. Understand the importance of structured data in modern corporate reporting and how it enables better analysis of sustainability information."
    }
];

export default function CardCarousel() {
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    return (
        <div className="w-full max-w-6xl mx-auto py-16 px-12 relative">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: true,
                    containScroll: "trimSnaps",
                    slidesToScroll: 1,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {cards.map((card, index) => (
                        <CarouselItem key={index} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 h-200">
                            <div className="p-1 h-full">
                                <Card
                                    className="cursor-pointer transition-transform duration-200 hover:scale-105 h-full flex flex-col"
                                    onClick={() => setSelectedCard(cards[index])}
                                >
                                    <CardContent className="p-6 flex flex-col flex-1">
                                        <div className="mb-4 text-blue-700">{card.icon}</div>
                                        <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                                        <p className="text-sm text-gray-600 flex-grow">{card.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-12 top-1/2 transform -translate-y-1/2"/>
                <CarouselNext className="absolute -right-12 top-1/2 transform -translate-y-1/2"/>
            </Carousel>
            {selectedCard &&
                <EducationModal
                    isOpen={true}
                    onClose={() => setSelectedCard(null)}
                    content={selectedCard}
                />}
        </div>
    );
}