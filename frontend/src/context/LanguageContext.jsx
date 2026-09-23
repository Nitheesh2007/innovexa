import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const language = 'en';

  // Synchronize <html> lang attribute to en
  useEffect(() => {
    document.documentElement.setAttribute('lang', 'en');
    localStorage.setItem('stockflow_lang', 'en');
    localStorage.setItem('language', 'en');
  }, []);

  // Passthrough translation helper for English
  const t = (key, fallback) => {
    return fallback || key || '';
  };

  return (
    <LanguageContext.Provider
      value={{
        language: 'en',
        setLanguage: () => {},
        toggleLanguage: () => {},
        t,
        isTamil: false,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
