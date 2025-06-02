import { component$, useContext, useSignal } from '@builder.io/qwik';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';
import { type Experience, getExperiences } from '../data/experiences';

export const ExperienceMap = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];
  const experiences = getExperiences(languageStore.current);
  const selected = useSignal<Experience | null>(null);

  return (
    <section class="relative h-screen w-full mb-16">
      <div class="absolute inset-0 bg-gray-800/50" />
      <div class="relative h-full w-full">
        {experiences.map((exp, index) => (
          <button
            key={exp.company}
            class="absolute bg-purple-500/40 hover:bg-purple-500 text-white rounded-full p-4 transition-all"
            style={{ left: `${20 + index * 15}%`, top: `${30 + index * 10}%` }}
            onClick$={() => { selected.value = exp; }}
          >
            {exp.company}
          </button>
        ))}
      </div>
      {selected.value && (
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 class="text-xl font-semibold mb-2">{selected.value.company}</h3>
            <p class="text-gray-400 mb-2">{selected.value.role}</p>
            <ul class="list-disc list-inside mb-4 text-gray-300">
              {selected.value.description.map((desc) => (
                <li key={desc}>{desc}</li>
              ))}
            </ul>
            <button
              class="mt-2 px-4 py-2 bg-purple-500 rounded"
              onClick$={() => { selected.value = null; }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
});
