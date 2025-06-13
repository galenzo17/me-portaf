import { component$ } from "@builder.io/qwik";
import { LanguageProvider } from "./context/LanguageContext";
import { MouseFollow } from "./components/MouseFollow";
import { Games } from "./components/Games";

export const GamesApp = component$(() => {
  return (
    <LanguageProvider>
      <div class="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <MouseFollow />
        <div class="relative z-10">
          <Games />
        </div>
      </div>
    </LanguageProvider>
  );
});
