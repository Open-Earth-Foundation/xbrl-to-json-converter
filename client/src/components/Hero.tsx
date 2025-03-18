import React from "react";

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
        <section className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 flex items-center justify-center relative">
            <h1 className="text-4xl my-4 md:text-5xl font-bold text-white mb-6 font-sans text-center">
                XBRL to JSON converter
            </h1>
        </section>
    );
}