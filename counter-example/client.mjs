// vim: set tw=99 ts=2 sts=2 sw=2 et:

'use strict';

import { createRoot } from 'react-dom/client';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { AiButtons, ChatGptBackend, ThinkingScreen } from 'react-redux-chatgpt';

const initState = { count: 0 };
const backend = new ChatGptBackend(initState);

const App = () => {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();

  return (
    <div>
      counter: {count}
      &nbsp;
      <button onClick={() => dispatch({ type: 'increment' })}>increment</button>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={backend.store}>
    <App />
    <AiButtons backend={backend} />
    <ThinkingScreen useSelector={useSelector} />
  </Provider>
);
