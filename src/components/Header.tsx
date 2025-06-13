import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const Header = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];
  const isSticky = useSignal(false);

  useVisibleTask$(() => {
    const onScroll = () => {
      isSticky.value = window.scrollY > 50;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  });

  const headerClasses = `text-center mb-16 animate-slide-down transition-all duration-300 ${
    isSticky.value ? 'fixed top-0 left-0 w-full bg-gray-900/80 backdrop-blur-sm py-2 z-40' : 'relative pt-6'
  }`;
  const gradientClasses = `absolute inset-0 -z-10 transform-gpu ${
    isSticky.value ? 'hidden' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl'
  }`;
  const titleClasses = `font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 ${
    isSticky.value ? 'text-2xl' : 'text-5xl'
  }`;
  const roleClasses = `text-gray-300 mb-4 transition-opacity duration-300 ${
    isSticky.value ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 text-2xl'
  }`;

  return (
    <header class={headerClasses}>
      <div class={gradientClasses}></div>
      <h1 class={titleClasses}>Agustín Bereciartúa Castillo</h1>
      <p class={roleClasses}>{t.role}</p>
      <div class="flex justify-center flex-wrap gap-4 text-gray-300">
        <a href="mailto:bereciartua.agustin@gmail.com" class="hover:text-purple-400 transition-colors">
          <span class={isSticky.value ? '' : 'sm:hidden'}>📧</span>
          <span class={isSticky.value ? 'hidden' : 'hidden sm:inline'}>📧 bereciartua.agustin@gmail.com</span>
        </a>
        <span class={`hidden sm:inline ${isSticky.value ? 'hidden' : ''}`>|</span>
        <a href="/services.html" class="hover:text-purple-400 transition-colors">
          <span class={isSticky.value ? '' : 'sm:hidden'}>🛠️</span>
          <span class={isSticky.value ? 'hidden' : 'hidden sm:inline'}>{t.servicesTitle}</span>
        </a>
        <span class={`hidden sm:inline ${isSticky.value ? 'hidden' : ''}`>|</span>
        <a href="tel:+5693570521" class="hover:text-purple-400 transition-colors">
          <span class={isSticky.value ? '' : 'sm:hidden'}>📱</span>
          <span class={isSticky.value ? 'hidden' : 'hidden sm:inline'}>📱 +569 3570 5212</span>
        </a>
      </div>
    </header>
  );
});
