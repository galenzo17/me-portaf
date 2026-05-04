import { component$, useSignal, useVisibleTask$, useContext } from '@builder.io/qwik';
import { marked } from 'marked';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

const posts: BlogPost[] = [
  {
    slug: 'nasa-level',
    title: 'La búsqueda (imposible) del NASA level code',
    date: '2026-05-04',
    excerpt: 'Qué sobrevive de las reglas del JPL cuando trabajás en healthtech, con plazos reales y un equipo chico.',
  },
];

export const Blog = component$(() => {
  const languageStore = useContext(LanguageContext);
  const t = translations[languageStore.current];
  const postSlug = useSignal<string | null>(null);
  const postContent = useSignal('');
  const loading = useSignal(false);

  useVisibleTask$(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('post');
    if (slug) {
      postSlug.value = slug;
      loading.value = true;
      fetch(`/blog/${slug}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('Post not found');
          return res.text();
        })
        .then((md) => {
          postContent.value = marked(md) as string;
          loading.value = false;
        })
        .catch(() => {
          postContent.value = '<p class="text-red-400">Post not found.</p>';
          loading.value = false;
        });
    }
  });

  if (postSlug.value) {
    return (
      <div class="max-w-3xl mx-auto px-6 py-12">
        <a
          href="/blog.html"
          class="inline-block mb-8 text-purple-400 hover:text-purple-300 transition-colors"
        >
          &larr; {t.blogBack}
        </a>
        {loading.value ? (
          <div class="text-gray-400 animate-pulse">Loading...</div>
        ) : (
          <article
            class="prose prose-invert prose-purple max-w-none
              prose-headings:bg-clip-text prose-headings:text-transparent
              prose-headings:bg-gradient-to-r prose-headings:from-purple-400 prose-headings:to-pink-600
              prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300
              prose-code:text-pink-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-800/80 prose-pre:border prose-pre:border-gray-700
              prose-strong:text-gray-200
              prose-blockquote:border-purple-500 prose-blockquote:text-gray-300"
            dangerouslySetInnerHTML={postContent.value}
          />
        )}
      </div>
    );
  }

  return (
    <div class="max-w-3xl mx-auto px-6 py-12">
      <div class="text-center mb-12">
        <a
          href="/"
          class="inline-block mb-4 text-purple-400 hover:text-purple-300 transition-colors text-sm"
        >
          &larr; Home
        </a>
        <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          {t.blogTitle}
        </h1>
      </div>

      <div class="space-y-6">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog.html?post=${post.slug}`}
            class="block group"
          >
            <div class="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-300">
              <div class="flex items-center gap-3 mb-2">
                <time class="text-sm text-gray-500">{post.date}</time>
              </div>
              <h2 class="text-xl font-semibold text-gray-200 group-hover:text-purple-400 transition-colors mb-2">
                {post.title}
              </h2>
              <p class="text-gray-400 text-sm leading-relaxed">{post.excerpt}</p>
              <span class="inline-block mt-3 text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                {t.blogReadMore} &rarr;
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});
