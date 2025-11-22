import { component$, useContext } from "@builder.io/qwik";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

const games = [
  {
    id: "snake",
    emoji: "🐍",
    url: "https://galenzo17.github.io/snake-game/",
  },
  {
    id: "tetris",
    emoji: "🧱",
    url: "https://galenzo17.github.io/tetris-game/",
  },
  {
    id: "pong",
    emoji: "🏓",
    url: "https://galenzo17.github.io/pong-game/",
  },
];

export const GameDemos = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];

  return (
    <section class="py-16 px-4 md:px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t.gameDemosTitle}
        </h2>
        <p class="text-gray-400 text-center mb-8">
          {t.gameDemosDescription}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          {games.map((game) => (
            <a
              key={game.id}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              class="group relative px-6 py-4 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl group-hover:animate-bounce">{game.emoji}</span>
                <span class="font-semibold text-gray-200 group-hover:text-purple-300 transition-colors">
                  {t.games[game.id as keyof typeof t.games]}
                </span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});
