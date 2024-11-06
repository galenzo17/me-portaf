import {
  createContextId,
  component$,
  Slot,
  useContextProvider,
  useStore,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import { LanguageToggle } from "../components/LanguageToggle";

export type Language = "en" | "es";

export interface LanguageStore {
  current: Language;
}

export const LanguageContext =
  createContextId<LanguageStore>("language-context");

export const LanguageProvider = component$(() => {
  const store = useStore<LanguageStore>({
    current: "en",
  });

  const toggleLanguage = $(() => {
    store.current = store.current === "en" ? "es" : "en";
  });

  useVisibleTask$(() => {
    store.current = navigator.language.startsWith("es") ? "es" : "en";
  });

  useContextProvider(LanguageContext, store);

  return (
    <>
      <LanguageToggle toggleLanguage={toggleLanguage} />
      <Slot />
    </>
  );
});
