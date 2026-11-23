import React from 'react';
import ProgramAboutBipaPage from './program-about/ProgramAboutBipaPage';
import ProgramAboutPpbPage from './program-about/ProgramAboutPpbPage';
import ProgramAboutPppPage from './program-about/ProgramAboutPppPage';

const PROGRAM_PAGES = {
  'program-bipa-129': ProgramAboutBipaPage,
  'program-pelayanan-bahasa-127': ProgramAboutPpbPage,
  'program-penerjemahan-dan-penjurubahasaan-1283': ProgramAboutPppPage,
};

export default function ProgramAboutPage({ serviceSlug }) {
  const ProgramPage = PROGRAM_PAGES[serviceSlug] || ProgramAboutBipaPage;
  return <ProgramPage />;
}
