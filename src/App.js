import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import IdentifyPage from "./pages/IdentifyPage";
import ExplorePageMain from "./pages/ExplorePageMain";
import ExplorePageFinal from "./pages/ExplorePageFinal";
import ExplorePageFinal2 from "./pages/ExplorePageFinal2";
import ExploreFinal3 from "./pages/ExploreFinal3";


function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              {/*<Route path="/explore" element={<ExplorePage />} />*/}
              <Route path="/explore" element={<ExplorePageFinal2/>} />
              <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
      </Router>
  );
}

export default App;
