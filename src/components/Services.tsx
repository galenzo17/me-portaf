import { component$, useContext } from '@builder.io/qwik';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const Services = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];

  return (
    <section class="max-w-4xl mx-auto mb-16">
      <h2 class="text-3xl font-bold mb-4 text-purple-400">{t.servicesTitle}</h2>
      <p class="mb-6 text-gray-300">{t.servicesIntro}</p>
      <div class="space-y-4">
        {t.serviceList.map((service: { title: string; description: string }) => (
          <div
            key={service.title}
            class="card-interactive bg-gray-800/30 p-4 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
          >
            <h3 class="text-xl font-semibold mb-2 hover:text-purple-400 transition-colors">
              {service.title}
            </h3>
            <p class="text-gray-300">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
