import { component$, useContext } from "@builder.io/qwik";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../i18n/translations";
import { type Experience, getExperiences } from "../data/experiences";

export const Experience = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];
  const experiences = getExperiences(languageStore.current);

  return (
    <section class="max-w-4xl mx-auto mb-16">
      <h2 class="text-3xl font-bold mb-8 text-purple-400">{t.experience}</h2>
      <div class="space-y-8">
        {experiences.map((exp, index) => (
          <div
            key={exp.company}
            class="card-interactive bg-gray-800/30 p-6 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-semibold">
                  <a
                    href={exp.url}
                    target="_blank"
                    class="hover:text-purple-400 transition-colors inline-block hover:-translate-y-0.5 transform duration-200"
                  >
                    {exp.company}
                  </a>
                </h3>
                <p class="text-gray-400">{exp.role}</p>
              </div>
              <span class="text-gray-400">{exp.period}</span>
            </div>
            <ul class="list-disc list-inside mb-4 text-gray-300">
              {exp.description.map((desc) => (
                <li key={desc} class="mb-2 hover:text-white transition-colors">
                  {desc}
                </li>
              ))}
            </ul>
            <div class="flex flex-wrap gap-2">
              {exp.stack.map((tech) => (
                <span
                  key={tech}
                  class="px-3 py-1 bg-purple-500/20 rounded-full text-sm hover:bg-purple-500/30 transition-all duration-200 hover:scale-105 transform"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
