# `react-redux-chatgpt`

*See the [blog post](https://spindas.dreamwidth.org/4207.html) for more information!*

This plugin can pretend to be your React/Redux app's backend by using [ChatGPT](https://chat.openai.com) as a universal reducer. It feeds the AI your store's initial state and, whenever an action is dispatched by your app, it forwards the action to the AI and asks for the next state.

ChatGPT doesn't have an official API yet, so you'll need to connect this client-side library to a local [relay server](../chatgpt-relay-server) to proxy your requests to OpenAI.

Check out the [counter](../counter-example) and [TodoMVC](../todomvc-example) demos in this repo for usage examples.

## API

## `new ChatGptBackend(initState[, options])`

Initializes a new pretend app backend. This corresponds to a single ChatGPT conversation which the instance will manage for you in the background.

- `initState`: The initial state of your Redux store. Usually an object. Must be `JSON.stringify` compatible.
- `options`: An optional object with extra parameters:
  - `apiBase`: The base URL of the [relay server](../chatgpt-relay-server) to query. *Default:* `http://127.0.0.1:3000`
  - `description`: A description of your app to pass on to ChatGPT to help it understand what's going on and generate better state transitions.
  - `errorHandler`: A callback function which will be passed any errors resulting from asynchronously reducing dispatched actions. *Default:* `console.error`

### `ChatGptBackend#store`

A standard Redux store object, preconfigured and wired up to ChatGPT. Actions dispatched to this store will be reduced asynchronously by the AI. If additional actions are dispatched while one is still being processed, they'll be queued up and resolved first-in first-out. Multiple actions can be processed in one round-trip to the AI (within reason) by dispatching an array of actions (i.e., `backend.store.dispatch([action1, action2, action3])`). All actions must be `JSON.stringify` compatible.

### `async ChatGptBackend#drain()`

Returns a `Promise` that will be resolved when the action-reducing queue is empty.

### `async ChatGptBackend#synthesizeReducer()`

Ask the AI to generate JavaScript implementing a reducer function for your app which can handle the actions and states the AI has observed so far. Returns a `Promise` that will be resolved with the AI's response, in Markdown format.

### `async ChatGptBackend#synthesizeActions(description)`

Ask the AI to generate one or more actions from a natural language request, based on the actions it has observed so far and the current state of the store. Returns a `Promise` that will be resolved with the AI's response as an array of actions.

- `description`: A string describing what the user wants to happen (e.g., "mark all todos as complete").

### `async ChatGptBackend#query(prompt)`

Send a custom prompt to the AI. Returns a `Promise` resolving to a string containing the AI's response. Note, to keep the AI on track in the central action-reducing loop, this will be appended to a separate fork of the underlying conversation. As a result, the AI won't remember previous prompts passed to `query` when responding to future prompts.

- `prompt`: A string prompt to send to ChatGPT.

### `isThinking(state)`

Given the current state of a `ChatGptBackend#store`, returns a bool indicating whether the backend is currently asynchronously reducing an action with the AI. This is stored in a hidden `Symbol` field of the state object, which this helper function can read.

### `ThinkingScreen`

A stock React component for displaying a "thinking..." overlay whenever the AI is asynchronously reducing an action. To work around a limitation in React Contexts, this component must be passed a `useSelector` function which accesses the `ChatGptBackend#store`:

```jsx
import { Provider, useSelector } from 'react-redux';
import { ChatGptBackend, ThinkingScreen } from 'react-redux-chatgpt';

const backend = new ChatGptBackend({ count: 0 });

<Provider store={backend.store}>
  <ThinkingScreen useSelector={useSelector} />
</Provider>
```

### `AiButtons`

A stock React component implementing a floating bottom bar with buttons for experimenting with the AI by synthesizing reducer code, synthesizing actions, dispatching custom actions, and prompting ChatGPT with custom queries. Must be passed a reference to the `ChatGptBackend` as a prop:

```jsx
import { AiButtons, ChatGptBackend } from 'react-redux-chatgpt';

const backend = new ChatGptBackend({ count: 0 });

<AiButtons backend={backend} />
```

## Development

[pnpm](https://pnpm.io/) is the recommended package manager. Available scripts:

- `pnpm run fmt:check` - Check code style.
- `pnpm run fmt:write` - Auto-format all code.

## License

Copyright (C) 2022 Michael Smith &lt;michael@spinda.net&gt; (https://spinda.net)

This program is free software: you can redistribute it and/or modify it under the terms of the Mozilla Public License, version 2.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the Mozilla Public License for more details.

You should have received a [copy](LICENSE) of the Mozilla Public License along with this program. If not, see [https://www.mozilla.org/en-US/MPL/2.0/](https://www.mozilla.org/en-US/MPL/2.0/).

Helpful resources:

- [Mozilla's MPL-2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)
- [MPL-2.0 on TLDRLegal](https://tldrlegal.com/license/mozilla-public-license-2.0-\(mpl-2\))

#### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this work by you shall be licensed as above, without any additional terms or conditions.
