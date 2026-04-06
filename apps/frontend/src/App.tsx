import { useState, useCallback } from "react";
import Terminal from "./components/Terminal";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <>
      <Terminal />
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
}

export default App;
