import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import IdentifyPage from "./pages/IdentifyPage";
import ExplorePageCenter from "./pages/ExplorePageCenter";
import ExplorePageInfo from "./pages/ExplorePageInfoOld";
import ExplorePageSize from "./pages/ExplorePageSize";
import ExplorePageSize2 from "./pages/ExplorePageSize2";
import ExplorePageInfo2 from "./pages/ExplorePageInfo2";


function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              {/*<Route path="/explore" element={<ExplorePageCenter />} />*/}
              <Route path="/explore" element={<ExplorePageInfo2 />} />
              {/*<Route path="/explore" element={<ExplorePageSize2 />} />*/}
              <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
      </Router>
  );
}

export default App;
