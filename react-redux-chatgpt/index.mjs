// vim: set tw=99 ts=2 sts=2 sw=2 et:

// Part of react-redux-chatgpt, a plugin for auto-reducing Redux actions by
// running them through the ChatGPT AI.

// Copyright (C) 2022 Michael Smith <michael@spinda.net> (https://spinda.net)

// This Source Code Form is subject to the terms of the Mozilla Public License,
// v. 2.0. If a copy of the MPL was not distributed with this file, You can
// obtain one at http://mozilla.org/MPL/2.0/.

'use strict';

import queue from 'fastq';
import { applyMiddleware, createStore } from 'redux';

const thinkingSymbol = Symbol('thinking');
export const isThinking = state => state[thinkingSymbol];
const setThinking = (state, value) => {
  Object.defineProperty(state, thinkingSymbol, {
    configurable: true,
    enumerable: false,
    writable: true,
    value,
  });
};

export class ChatGptBackend {
  constructor(initState, options = {}) {
    initState = { ...initState };
    setThinking(initState, false);

    this._queryUrl = new URL('query', options.apiBase || 'http://127.0.0.1:3000');
    this._errorHandler = options.errorHandler || console.error;

    this._queue = queue.promise(callback => callback(), 1);
    this._thread = {};

    this._manifest = {
      description: options.description != null ? String(options.description) : null,
    };

    this._hasStarted = false;

    const middleware =
      ({ dispatch, getState }) =>
      next =>
      action => {
        next({ type: 'thinking' });
        this._queue.push(async () => {
          try {
            next({ type: 'thinking' });

            const state = getState();
            const newState = await this._reduce(state, action);

            next(state === newState ? { type: 'cancel' } : { type: 'update', newState });
          } catch (error) {
            this._errorHandler(error);
            next({ type: 'cancel' });
          }
        });
      };

    const reducer = (state, action) => {
      if (state === undefined) {
        return initState;
      }
      switch (action.type) {
        case 'thinking': {
          if (!isThinking(state)) {
            state = { ...state };
            setThinking(state, true);
          }
          break;
        }
        case 'cancel': {
          if (isThinking(state)) {
            state = { ...state };
            setThinking(state, false);
          }
          break;
        }
        case 'update': {
          state = action.newState;
          setThinking(state, false);
          break;
        }
      }
      return state;
    };

    this.store = createStore(reducer, applyMiddleware(middleware));
    this.store.subscribe(() => {
      const state = this.store.getState();
      if (!isThinking(state)) {
        console.log('==>', state);
      }
    });
  }

  async drain() {
    await this._queue.drained();
  }

  query(prompt) {
    return this._queue.push(async () => (await this._query(prompt)).response);
  }

  async _query(prompt) {
    console.log('Q:', prompt);

    const result = await (
      await fetch(this._queryUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this._thread,
          prompt,
        }),
      })
    ).json();

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.response) {
      console.log('A:', result.response);
    }

    return result;
  }

  async _queryJson(prompt) {
    let attempt = 0;
    while (true) {
      const result = await this._query(prompt);
      try {
        result.response = JSON.parse(result.response);
        return result;
      } catch (error) {
        if (++attempt < 3) {
          console.error(`Failed attempt #${attempt}; retrying...`, error);
        } else {
          throw error;
        }
      }
    }
  }

  async _reduce(state, action) {
    let prompt = '';

    if (!this._hasStarted) {
      prompt = "I'm a React/Redux app. I have a single data store.\n\n";

      if (this._manifest.description !== null) {
        prompt += `A description of the app is: ${this._manifest.description}\n\n`;
      }

      prompt += `Here's the initial state of my store, in JSON form: ${JSON.stringify(state)}\n\n`;
    }

    let hasMultipleActions = false;
    if (Array.isArray(action)) {
      if (action.length < 1) {
        return state;
      } else if (action.length < 2) {
        action = action[0];
      } else {
        hasMultipleActions = true;
      }
    }
    prompt +=
      'My Redux reducers received ' +
      (hasMultipleActions ? 'some actions' : 'an action') +
      ', here encoded in JSON form: ' +
      JSON.stringify(action) +
      '\n\n' +
      (this._hasStarted ? 'Given the state of the store in your previous response, w' : 'W') +
      'hat should the new state of my store be after this action? Provide your answer in ' +
      'JSON form. Reply with only the answer in JSON form and include no other commentary.';

    const result = await this._queryJson(prompt);
    this._hasStarted = true;
    this._thread.conversationId = result.conversationId;
    this._thread.parentMessageId = result.messageId;
    return result.response;
  }

  synthesizeReducer() {
    return this.query(
      'Give me JavaScript code that implements my reducer function. It should be able to handle ' +
        'all of the actions I told you I received, producing the states you told me would ' +
        'result from applying them.'
    );
  }

  synthesizeActions(description) {
    return this._queue.push(async () => {
      const actions = await this._queryJson(
        `The user has requested that I do the following: ${description}\n\nGiven the state of ` +
          'the store in your previous response and the types of actions I have received so far, ' +
          'what action(s) should I dispatch to my Redux store in order to complete this ' +
          'request? Provide your answer in the form of a JSON array of actions. Reply with only ' +
          'the answer in JSON array form and include no other commentary.'
      );
      return Array.isArray(actions) ? actions : [actions];
    });
  }
}

export const ThinkingScreen = ({ useSelector }) => {
  const thinking = useSelector(state => isThinking(state));

  return (
    <div
      style={{
        display: thinking ? 'flex' : 'none',
        position: 'fixed',
        zIndex: 9999,
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        opacity: 0.5,
        backgroundColor: 'black',
        color: 'white',
        fontSize: '12vw',
        userSelect: 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      thinking...
    </div>
  );
};

export const AiButtons = ({ backend }) => {
  const synthesizeActionsHandler = () => {
    const description = prompt('What do you want me to do?');
    if (description) {
      backend.synthesizeActions(description);
    }
  };

  const performCustomActionsHandler = () => {
    const actions = prompt('Action JSON:');
    if (actions) {
      backend.store.dispatch(JSON.parse(actions));
    }
  };

  const askCustomQueryHandler = () => {
    const query = prompt('Prompt for ChatGPT:');
    if (query) {
      backend.query(query);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        width: '100%',
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '2px',
      }}
    >
      <input
        type="button"
        value="synthesize reducer"
        onClick={() => backend.synthesizeReducer()}
      />
      &nbsp;
      <input type="button" value="synthesize actions" onClick={synthesizeActionsHandler} />
      &nbsp;
      <input
        type="button"
        value="perform custom action(s)"
        onClick={performCustomActionsHandler}
      />
      &nbsp;
      <input type="button" value="ask custom query" onClick={askCustomQueryHandler} />
    </div>
  );
};
