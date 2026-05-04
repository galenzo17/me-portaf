import '@builder.io/qwik/qwikloader.js';
import { render } from '@builder.io/qwik';
import './index.css';
import { BlogApp } from './blog-app';

render(document.getElementById('app') as HTMLElement, <BlogApp />);
