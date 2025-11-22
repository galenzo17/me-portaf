import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export const SnakeGame = component$(() => {
  const snake = useSignal<Position[]>([{ x: 10, y: 10 }]);
  const food = useSignal<Position>({ x: 15, y: 15 });
  const direction = useSignal<Direction>("RIGHT");
  const gameOver = useSignal(false);
  const score = useSignal(0);
  const isPlaying = useSignal(false);

  const generateFood = $(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.value.some((s) => s.x === newFood.x && s.y === newFood.y));
    food.value = newFood;
  });

  const resetGame = $(() => {
    snake.value = [{ x: 10, y: 10 }];
    direction.value = "RIGHT";
    gameOver.value = false;
    score.value = 0;
    isPlaying.value = true;
    generateFood();
  });

  const moveSnake = $(() => {
    if (gameOver.value || !isPlaying.value) return;

    const head = { ...snake.value[0] };

    switch (direction.value) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver.value = true;
      isPlaying.value = false;
      return;
    }

    // Check self collision
    if (snake.value.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver.value = true;
      isPlaying.value = false;
      return;
    }

    const newSnake = [head, ...snake.value];

    // Check food collision
    if (head.x === food.value.x && head.y === food.value.y) {
      score.value += 10;
      generateFood();
    } else {
      newSnake.pop();
    }

    snake.value = newSnake;
  });

  // Game loop
  useVisibleTask$(({ cleanup }) => {
    const interval = setInterval(() => {
      moveSnake();
    }, INITIAL_SPEED);

    cleanup(() => clearInterval(interval));
  });

  // Keyboard controls
  useVisibleTask$(({ cleanup }) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying.value && !gameOver.value) {
        isPlaying.value = true;
        generateFood();
      }

      switch (e.key) {
        case "ArrowUp":
          if (direction.value !== "DOWN") direction.value = "UP";
          break;
        case "ArrowDown":
          if (direction.value !== "UP") direction.value = "DOWN";
          break;
        case "ArrowLeft":
          if (direction.value !== "RIGHT") direction.value = "LEFT";
          break;
        case "ArrowRight":
          if (direction.value !== "LEFT") direction.value = "RIGHT";
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    cleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4 pb-20 md:pb-4 md:justify-center">
      {/* Header with back button */}
      <div class="w-full max-w-md flex items-center justify-between mb-4 mt-2 md:mt-0">
        <a
          href="/"
          class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-white text-sm"
        >
          <span>←</span> Back
        </a>
        <h1 class="text-2xl md:text-4xl font-bold text-green-400">Snake</h1>
        <p class="text-gray-400 text-sm">Score: <span class="text-green-400 font-bold">{score.value}</span></p>
      </div>

      {/* Game board */}
      <div
        class="relative bg-gray-800 border-2 border-green-500/50 rounded-lg"
        style={{
          width: `${GRID_SIZE * CELL_SIZE}px`,
          height: `${GRID_SIZE * CELL_SIZE}px`,
        }}
      >
        {/* Snake */}
        {snake.value.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            class={`absolute rounded-sm ${index === 0 ? "bg-green-400" : "bg-green-500"}`}
            style={{
              width: `${CELL_SIZE - 2}px`,
              height: `${CELL_SIZE - 2}px`,
              left: `${segment.x * CELL_SIZE + 1}px`,
              top: `${segment.y * CELL_SIZE + 1}px`,
            }}
          />
        ))}

        {/* Food */}
        <div
          class="absolute bg-red-500 rounded-full"
          style={{
            width: `${CELL_SIZE - 2}px`,
            height: `${CELL_SIZE - 2}px`,
            left: `${food.value.x * CELL_SIZE + 1}px`,
            top: `${food.value.y * CELL_SIZE + 1}px`,
          }}
        />

        {/* Game over overlay */}
        {gameOver.value && (
          <div class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
            <p class="text-2xl text-red-400 font-bold mb-4">Game Over!</p>
            <p class="text-gray-300 mb-4">Final Score: {score.value}</p>
            <button
              onClick$={resetGame}
              class="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Start overlay */}
        {!isPlaying.value && !gameOver.value && (
          <div class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
            <p class="text-xl text-green-400 font-bold mb-2">Press any arrow key to start</p>
            <p class="text-gray-400 text-sm">Use arrow keys to move</p>
          </div>
        )}
      </div>

      {/* Mobile controls - horizontal layout to avoid Android nav */}
      <div class="mt-4 flex items-center gap-3 md:hidden">
        <button
          onClick$={() => {
            if (!isPlaying.value && !gameOver.value) {
              isPlaying.value = true;
              generateFood();
            }
            if (direction.value !== "RIGHT") direction.value = "LEFT";
          }}
          class="p-3 bg-gray-700 active:bg-gray-600 rounded-lg text-xl"
        >
          ←
        </button>
        <div class="flex flex-col gap-2">
          <button
            onClick$={() => {
              if (!isPlaying.value && !gameOver.value) {
                isPlaying.value = true;
                generateFood();
              }
              if (direction.value !== "DOWN") direction.value = "UP";
            }}
            class="p-3 bg-gray-700 active:bg-gray-600 rounded-lg text-xl"
          >
            ↑
          </button>
          <button
            onClick$={() => {
              if (!isPlaying.value && !gameOver.value) {
                isPlaying.value = true;
                generateFood();
              }
              if (direction.value !== "UP") direction.value = "DOWN";
            }}
            class="p-3 bg-gray-700 active:bg-gray-600 rounded-lg text-xl"
          >
            ↓
          </button>
        </div>
        <button
          onClick$={() => {
            if (!isPlaying.value && !gameOver.value) {
              isPlaying.value = true;
              generateFood();
            }
            if (direction.value !== "LEFT") direction.value = "RIGHT";
          }}
          class="p-3 bg-gray-700 active:bg-gray-600 rounded-lg text-xl"
        >
          →
        </button>
      </div>

      <p class="mt-4 text-gray-500 text-sm hidden md:block">Use arrow keys to control the snake</p>
    </div>
  );
});
