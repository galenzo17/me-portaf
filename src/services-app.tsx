import { component$ } from '@builder.io/qwik';
import { LanguageProvider } from './context/LanguageContext';
import { Services } from './components/Services';
import { SocialLinks } from './components/SocialLinks';
import { MouseFollow } from './components/MouseFollow';
import './app.css';

export const ServicesApp = component$(() => {
  return (
    <LanguageProvider>
      <div class="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <MouseFollow />
        <div class="relative z-10">
          <Services />
          <SocialLinks />
        </div>
      </div>
    </LanguageProvider>
  );
});
