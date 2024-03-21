import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import IdentifyPage from "./pages/IdentifyPage";
// import ExplorePage from "./pages/ExplorePage";
// import ExplorePage2 from "./pages/ExplorePage2";
// import ExplorePage3 from "./pages/ExplorePage3";
import ExplorePage7 from "./pages/ExplorePage7";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              {/*<Route path="/explore" element={<ExplorePage />} />*/}
              <Route path="/explore" element={<ExplorePage7 />} />
              <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
      </Router>
  );
}

export default App;
