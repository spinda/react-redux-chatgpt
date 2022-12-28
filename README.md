# React/Redux apps powered by ChatGPT!

*See the [blog post](https://spindas.dreamwidth.org/4207.html) for more information!*

This is an experiment in prototyping webapps with [ChatGPT](https://chat.openai.com) as a universal Redux reducer. The idea is you implement your app's frontend in [React](https://reactjs.org/) and [Redux](https://redux.js.org/), but skip initially implementing the backend and Redux reducers (i.e., the business logic). Instead, your app's initial state and actions are fed through the AI, which predicts future states automagically. After training the AI by interacting with your frontend, you can even ask it to implement the reducer function for you.

This repo has multiple parts:

- [`react-redux-chatgpt/`](react-redux-chatgpt) - The main event. A client-side plugin implementing a Redux store whose actions are reduced by ChatGPT.
- [`counter-example/`](counter-example) - The basic React/Redux counter app example, with the reducing handled by ChatGPT.
- [`todomvc-example/`](todomvc-example) - A more advanced example, implementing the [TodoMVC](https://todomvc.com/) todo app challenge with React/Redux and ChatGPT.
- [`chatgpt-relay-server/`](chatgpt-relay-server) - A simple REST API server for proxying messages through ChatGPT.

## Watch the Demo Videos!

### Counter

[![Counter demo video on YouTube](https://img.youtube.com/vi/u9rE7sfCmj8/mqdefault.jpg)](https://www.youtube.com/watch?v=u9rE7sfCmj8)

### TodoMVC

[![Demo video on YouTube](https://img.youtube.com/vi/GgR1QiPPie4/mqdefault.jpg)](https://www.youtube.com/watch?v=GgR1QiPPie4)
