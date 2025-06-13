import { component$, useContext } from '@builder.io/qwik';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const Header = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];

  return (
    <header class="text-center mb-16 animate-slide-down relative pt-6">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl -z-10 transform-gpu"></div>
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