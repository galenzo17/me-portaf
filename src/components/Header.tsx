import { component$, useContext } from '@builder.io/qwik';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const Header = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];

  return (
    <header class="text-center mb-16 animate-slide-down relative pt-6">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl -z-10 transform-gpu"></div>
      <div class="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
        <div class="book-walker">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="3" width="6" height="10" fill="#ffffff" stroke="#000000" stroke-width="1" />
            <rect x="9" y="3" width="6" height="10" fill="#ffffff" stroke="#000000" stroke-width="1" />
            <rect x="0" y="7" width="1" height="4" fill="#000000" />
            <rect x="15" y="7" width="1" height="4" fill="#000000" />
            <rect x="3" y="13" width="2" height="2" fill="#000000" />
            <rect x="11" y="13" width="2" height="2" fill="#000000" />
            <rect x="5" y="6" width="2" height="1" fill="#000000" />
            <rect x="9" y="6" width="2" height="1" fill="#000000" />
          </svg>
        </div>
      </div>
      <h1 class="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Agustín Bereciartúa Castillo
      </h1>
      <p class="text-2xl text-gray-300 mb-4">{t.role}</p>
      <div class="flex justify-center flex-wrap gap-4 text-gray-300">
        <a
          href="mailto:bereciartua.agustin@gmail.com"
          class="hover:text-purple-400 transition-colors"
        >
          <span class="sm:hidden">📧</span>
          <span class="hidden sm:inline">📧 bereciartua.agustin@gmail.com</span>
        </a>
        <span class="hidden sm:inline">|</span>
        <a href="/services.html" class="hover:text-purple-400 transition-colors">
          <span class="sm:hidden">🛠️</span>
          <span class="hidden sm:inline">{t.servicesTitle}</span>
        </a>
        <span class="hidden sm:inline">|</span>
        <a
          href="tel:+5693570521"
          class="hover:text-purple-400 transition-colors"
        >
          <span class="sm:hidden">📱</span>
          <span class="hidden sm:inline">📱 +569 3570 5212</span>
        </a>
      </div>
    </header>
  );
});
