import { component$ } from "@builder.io/qwik";
import { LanguageProvider } from "./context/LanguageContext";
import { Header } from "./components/Header";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { SocialLinks } from "./components/SocialLinks";
import { MouseFollow } from "./components/MouseFollow";
import { ZoomCanvas } from "./components/ZoomCanvas";
import { AsciiOcean } from "./components/AsciiOcean";
import "./app.css";

export const App = component$(() => {
  return (
    <LanguageProvider>
      <ZoomCanvas>
        <div class="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
          <MouseFollow />
          <AsciiOcean />
          <div class="relative z-10">
            <Header />
            <Experience />
            <Skills />
            <SocialLinks />
          </div>
        </div>
      </ZoomCanvas>
    </LanguageProvider>
  );
});
