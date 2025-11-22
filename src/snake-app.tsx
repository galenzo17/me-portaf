import { component$ } from '@builder.io/qwik';
import { SnakeGame } from './components/SnakeGame';
import './app.css';

export const SnakeApp = component$(() => {
  return <SnakeGame />;
});
