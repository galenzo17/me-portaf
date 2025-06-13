import '@builder.io/qwik/qwikloader.js'
import { render } from '@builder.io/qwik'
import './index.css'
import { GamesApp } from './games-app.tsx'

render(document.getElementById('games-app') as HTMLElement, <GamesApp />)
