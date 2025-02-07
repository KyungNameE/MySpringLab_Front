import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RealEstateMain from "./pages/RealEstateMain/RealEstateMain.tsx";
import PropertyDetail from "./pages/PropertyDetail/PropertyDetail.tsx";
import ManageProperties from "./pages/ManageProperties/ManageProperties.tsx";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RealEstateMain />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/manage" element={<ManageProperties />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
