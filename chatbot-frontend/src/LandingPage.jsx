// LandingPage.jsx
import React from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import concert_people from "./assets/c2.jpg";
//import concert_people from './assets/c4.webp';

const LandingPage = () => {
  return (
    <>
      <HeroSection backgroundImage={concert_people} />
      <AboutSection />
    </>
  );
};

export default LandingPage;
