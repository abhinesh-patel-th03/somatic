import React from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, normalizeLang } from "../i18n/languages";

function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={normalizeLang(i18n.language)}
      onChange={handleLanguageChange}
      aria-label="Select language"
    >
      {LANGUAGES.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
