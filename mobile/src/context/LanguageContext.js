import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../locales/en';
import { ta } from '../locales/ta';

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('app_language').then(savedLang => {
      if (savedLang) setLang(savedLang);
    });
  }, []);

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem('app_language', newLang);
  };

  const t = (key) => {
    const dictionary = lang === 'ta' ? ta : en;
    const translation = dictionary[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return en[key] || key; // fallback to English or the key itself
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
