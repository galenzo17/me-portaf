import { component$, useContext, QRL } from "@builder.io/qwik";
import { LanguageContext } from "../context/LanguageContext";

interface LanguageToggleProps {
  toggleLanguage: QRL<() => void>;
}

export const LanguageToggle = component$<LanguageToggleProps>(
  ({ toggleLanguage }) => {
    const languageStore = useContext(LanguageContext);

    return (
      <button
        onClick$={toggleLanguage}
        class="fixed top-4 right-4 px-4 py-2 bg-gray-800/80 rounded-full hover:bg-purple-500/20 transition-all transform hover:scale-110 z-50 flex items-center gap-1"
      >
        {languageStore.current === "en" ? (
          <>
            <span class="text-lg">🇪🇸</span>
            <span>ES</span>
          </>
        ) : (
          <>
            <span class="text-lg">🇺🇸</span>
            <span>EN</span>
          </>
        )}
      </button>
    );
  }
);
