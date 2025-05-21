import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";

export const MouseFollow = component$(() => {
  const mouseX = useSignal(0);
  const mouseY = useSignal(0);
  const isTouch = useSignal(false);

  useVisibleTask$(() => {
    const container = document.createElement("div");
    container.className = "pointer-events-none fixed inset-0 z-20 overflow-hidden";
    document.body.appendChild(container);

    const handlePointerMove = (e: PointerEvent) => {
      mouseX.value = e.clientX;
      mouseY.value = e.clientY;
      isTouch.value = e.pointerType === "touch";

      const particle = document.createElement("div");
      const size = Math.random() * 6 + 4;
      const dx = (Math.random() - 0.5) * 40;
      const dy = (Math.random() - 0.5) * 40;
      particle.className = "neon-particle";
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.setProperty("--dx", `${dx}px`);
      particle.style.setProperty("--dy", `${dy}px`);
      container.appendChild(particle);
      setTimeout(() => container.removeChild(particle), 800);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.body.removeChild(container);
    };
  });

  return (
    <div
      class="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px at ${mouseX.value}px ${mouseY.value}px, rgba(139, 92, 246, 0.2), transparent 80%)`,
      }}
    />
  );
});
