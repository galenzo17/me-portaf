import { component$ } from '@builder.io/qwik';

export const AsciiOcean = component$(() => {
  const islands = [
`  /\\
 /  \\
/____\\
  ||`,
`   /\\
  /--\\
 /____\\
   ||`,
`   /\\
  /  \\
 /____\\
 /||||\\`
  ];

  return (
    <div class="ascii-ocean absolute inset-0 overflow-hidden pointer-events-none">
      {islands.map((art, index) => (
        <pre
          key={index}
          class="ascii-island"
          style={{
            left: `${10 + index * 30}%`,
            top: `${20 + index * 15}px`,
            animationDelay: `${index * 1.5}s`,
          }}
        >{art}</pre>
      ))}
    </div>
  );
});
