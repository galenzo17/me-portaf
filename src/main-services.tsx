import '@builder.io/qwik/qwikloader.js';
import { render } from '@builder.io/qwik';
import './index.css';
import { ServicesApp } from './services-app';

render(document.getElementById('app') as HTMLElement, <ServicesApp />);
