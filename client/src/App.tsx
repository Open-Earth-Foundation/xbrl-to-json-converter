import { Switch, Route } from "wouter";
import Home from "./pages/Home.jsx";
import { Card, CardContent } from "./components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";


function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


function TabComponent() {
  const [activeTab, setActiveTab] = useState(0);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const handleTabSwitch = (event) => {
      setActiveTab(event.detail.tab);
    };

    window.addEventListener('switchTab', handleTabSwitch);

    // Prevent automatic scrolling on initial load
    if (initialLoadRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
      initialLoadRef.current = false;
    }

    return () => {
      window.removeEventListener('switchTab', handleTabSwitch);
    };
  }, []);

  // ... rest of TabComponent (rendering tabs, etc.) ...
  return <div>Active Tab: {activeTab}</div>;
}

export default App;