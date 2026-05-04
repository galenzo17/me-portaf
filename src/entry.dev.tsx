import { render } from '@builder.io/qwik';
import { App } from './app';
import { ServicesApp } from './services-app';
import { BlogApp } from './blog-app';
import './index.css';

export default function main() {
  const path = window.location.pathname;
  let root = document.getElementById('app');
  if (!root) {
    root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);
  }

  if (path.includes('services')) {
    render(root, <ServicesApp />);
  } else if (path.includes('blog')) {
    render(root, <BlogApp />);
  } else {
    render(root, <App />);
  }
}
