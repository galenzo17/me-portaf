import { component$, useSignal, $, Slot } from '@builder.io/qwik';

export const ZoomCanvas = component$(() => {
  const scale = useSignal(1);

  const zoomIn = $(() => {
    scale.value = Math.min(2, scale.value + 0.2);
  });

  const zoomOut = $(() => {
    scale.value = Math.max(0.5, scale.value - 0.2);
  });

  return (
    <>
      <div class="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick$={zoomOut}
          class="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
        >
          -
        </button>
        <button
          onClick$={zoomIn}
          class="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
        >
          +
        </button>
      </div>
      <div
        style={{
          transform: `scale(${scale.value})`,
          transformOrigin: 'center top',
          transition: 'transform 0.3s ease'
        }}
      >
        <Slot />
      </div>
    </>
  );
});
