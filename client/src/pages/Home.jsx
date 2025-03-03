import { useEffect, useState, useRef } from "react";

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

  // ... rest of the component code ...
}