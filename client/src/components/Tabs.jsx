const handleTabClick = (tab) => {
    // Don't scroll when changing tabs via direct click
    // This prevents unwanted scrolling behavior
    setActiveTab(tab);
    onTabChange(tab);
  };