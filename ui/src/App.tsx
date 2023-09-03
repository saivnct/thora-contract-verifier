import React, { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "./Context";
import Verifier from "./pages/Verifier";

function App() {
  useEffect(() => {
    document.title = "Thora Verifier";
  }, []);

  return (
    <div className="flex min-h-screen text-gray-800 bg-gray-50">
      <ContextProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Verifier />} />
          </Routes>
        </HashRouter>
      </ContextProvider>
    </div>
  );
}

export default App;
