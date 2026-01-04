import { render } from 'solid-js/web'
import { App } from './app'
import './tailwind.css'

const root = document.getElementById('root')
root && render(() => <App />, root)
