import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider, useSelector } from 'react-redux'
import { AiButtons, ChatGptBackend, ThinkingScreen } from 'react-redux-chatgpt';
import App from './components/App'
import 'todomvc-app-css/index.css'

const initState = {
  todos: [{ text: 'Use Redux', completed: false, id: 0 }],
  visibilityFilter: 'show_all'
}
const backend = new ChatGptBackend(initState, { description: 'todo list' })

render(
  <Provider store={backend.store}>
    <App />
    <AiButtons backend={backend} />
    <ThinkingScreen useSelector={useSelector} />
  </Provider>,
  document.getElementById('root')
)
