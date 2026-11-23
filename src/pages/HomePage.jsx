// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Programs from '../components/Programs';
import WhyChooseUs from '../components/WhyChooseUs';
import Clients from '../components/Clients';
import BlogUpdates from '../components/BlogUpdates';
import api, { getCachedLandingOverview } from '../services/api';

export default function HomePage({ onOpenRegister }) {
  const [landingOverview, setLandingOverview] = useState(getCachedLandingOverview);

  useEffect(() => {
    let isMounted = true;

    api.getLandingOverview()
      .then((res) => {
        if (isMounted) {
          setLandingOverview(res?.data || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLandingOverview(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      <Hero onOpenRegister={onOpenRegister} landingOverview={landingOverview} />
      <Programs landingOverview={landingOverview} />
      <WhyChooseUs landingOverview={landingOverview} />
      <Clients landingOverview={landingOverview} />
      <BlogUpdates landingOverview={landingOverview} />
    </main>
  );
}
