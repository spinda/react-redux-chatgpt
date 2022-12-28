# `chatgpt-relay-server`

[![npm: chatgpt-relay-server](https://img.shields.io/badge/npm-chatgpt--relay--server-0f80c0)](https://npmjs.com/package/chatgpt-relay-server)

*See the [blog post](https://spindas.dreamwidth.org/4207.html) for more information!*

[ChatGPT](https://chat.openai.com) doesn't have an official API yet, so this is a simple REST API server that proxies messages to a ChatGPT session running in a [Puppeteer](https://pptr.dev)-controlled browser instance (by way of the [`chatgpt`](https://www.npmjs.com/package/chatgpt) package). For ease of experimentation, the REST API server is [CORS-enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), ***and will respond to requests from any origin, without authentication***.

***Use at your own risk!*** I'm not responsible if this gets your account banned!

## Usage

[Google Chrome](https://www.google.com/chrome/) must be installed on your system, as required by the [`chatgpt`](https://www.npmjs.com/package/chatgpt) package.

`chatgpt-relay-server` accepts configuration via environment variables:

- `OPENAI_EMAIL`: Email address to auto-populate into the login form. If not supplied via environment variable, will be prompted for interactively.
- `OPENAI_PASSWORD`: Password to auto-populate into the login form. If not supplied via environment variable, will be prompted for interactively.
- `OPENAI_IS_GOOGLE_LOGIN`: Whether this is a Google account or an OpenAI account. Accepts anything truthy (`true`, `1`, ...) or falsey (`false`, `0`, ...) when parsed as JSON. If not supplied via environment variable, will be prompted for interactively.
- `CHATGPT_RELAY_SERVER_HOST`: Host for the REST API server to bind to. *Default:* `127.0.0.1`
- `CHATGPT_RELAY_SERVER_PORT`: Host for the REST API server to bind to. *Default:* `3000`

You can also supply additional environment variables containing tokens for CAPTCHA-bypassing services, as described in the documentation for the [`chatgpt`](https://github.com/transitive-bullshit/chatgpt-api/tree/77d1d8e0896a3ed087c70c0b71ed2091eb262717#captchas) package.

When running the server on the command line, it will first prompt you interactively for any configuration without a default not supplied via environment variables, and will then start up a browser instance and attempt to log into ChatGPT. You may have to complete one or more CAPTCHAs. On successful login, the REST API server will launch and start serving requests.

## API

### POST `/query`

**Request:** A JSON object with the following fields:

- `prompt`: The prompt to pass to ChatGPT.
- `conversationId`: *(optional)* The ID of the conversation thread this message should be a part of, if continuing an existing conversation.
- `parentMessageId`: *(optional)* The ID of the message this new message is in response to, if continuing an existing conversation. Can be used to fork off multiple conversation sub-threads.

**Success Response:** A JSON object with the following fields:

- `response`: The text of the response from ChatGPT. Usually Markdown.
- `conversationId`: The ID of the conversation containing the response message. Retain to continue the thread.
- `messageId`: The ID of the response message. Retain to continue the thread.

**Failure Response:** A JSON object with the following fields:

- `error`: The error message.

## Development

[pnpm](https://pnpm.io/) is the recommended package manager. Available scripts:

- `pnpm run fmt:check` - Check code style.
- `pnpm run fmt:write` - Auto-format all code.
- `pnpm run server:start` - Run the REST API server.

## License

[0BSD](LICENSE)

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this work by you shall be licensed as above, without any additional terms or conditions.
