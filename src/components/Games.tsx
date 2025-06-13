import { component$, useVisibleTask$, useStore } from "@builder.io/qwik";

interface Game {
  name: string;
  url: string;
}

interface NodeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const Games = component$(() => {
  const games: Game[] = [
    { name: "Space Nodes", url: "https://github.com/galenzo17/space-nodes" },
    { name: "Physics Puzzle", url: "https://github.com/galenzo17/physics-puzzle" },
    { name: "Astro Shooter", url: "https://github.com/galenzo17/astro-shooter" },
    { name: "Orbit Challenge", url: "https://github.com/galenzo17/orbit-challenge" },
    { name: "Galactic Runner", url: "https://github.com/galenzo17/galactic-runner" },
  ];

  const nodes = useStore<NodeState[]>([]);

  useVisibleTask$(({ cleanup }) => {
    nodes.length = games.length;
    for (let i = 0; i < games.length; i++) {
      nodes[i] = {
        x: Math.random() * window.innerWidth * 0.8,
        y: Math.random() * window.innerHeight * 0.8,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      };
    }

    const update = () => {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > window.innerWidth - 120) node.vx *= -1;
        if (node.y < 0 || node.y > window.innerHeight - 40) node.vy *= -1;
      }
      id = requestAnimationFrame(update);
    };

    let id = requestAnimationFrame(update);
    cleanup(() => cancelAnimationFrame(id));
  });

  return (
    <section class="relative w-full h-screen overflow-hidden">
      {games.map((game, index) => (
        <a
          key={game.name}
          href={game.url}
          target="_blank"
          class="absolute px-4 py-2 bg-gray-800/60 rounded-lg hover:bg-purple-600/50 transition-colors"
          style={{ transform: `translate(${nodes[index]?.x}px, ${nodes[index]?.y}px)` }}
        >
          {game.name}
        </a>
      ))}
    </section>
  );
});
