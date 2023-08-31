import React, { useEffect } from "react";
import ReviewsList from "./components/componentA/ReviewsList.jsx";
import RatingSummary from "./components/componentA/RatingSummary.jsx";
import QuestionsAndAnswers from "./components/componentV/Q&A.jsx";
import axios from "axios";
import Header from "./components/ComponentHeith/Header.jsx";
import AboutSection from "./components/ComponentHeith/AboutSection.jsx";
import Footer from "./components/ComponentHeith/Footer.jsx";
import OverviewModule from "./components/ComponentHeith/OverviewModule.jsx";

const App = () => {
  return (
    <div>
      <div className="header">
        <Header />
      </div>

      <div id="overview">
        <OverviewModule />
      </div>

      <div id="reviews">
        <ReviewsList />
      </div>
      <div id="Questions" className="bg-[#27272A]">
        <QuestionsAndAnswers />
      </div>

      <div id="about">
        <AboutSection />
        <Footer />
      </div>
    </div>
  );
};

export default App;
