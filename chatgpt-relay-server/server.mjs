#!/usr/bin/env node

// vim: set tw=99 ts=2 sts=2 sw=2 et:

'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import { ChatGPTAPIBrowser, ChatGPTError } from 'chatgpt';
import cors from 'cors';
import express from 'express';
import inquirer from 'inquirer';

const credentials = {};
const questions = [];

if (Object.hasOwn(process.env, 'OPENAI_EMAIL')) {
  credentials.email = process.env.OPENAI_EMAIL;
} else {
  questions.push({ name: 'email', message: 'OpenAI Email:' });
}

if (Object.hasOwn(process.env, 'OPENAI_PASSWORD')) {
  credentials.password = process.env.OPENAI_PASSWORD;
} else {
  questions.push({ name: 'password', message: 'OpenAI Password:', type: 'password', mask: true });
}

if (Object.hasOwn(process.env, 'OPENAI_IS_GOOGLE_LOGIN')) {
  credentials.isGoogleLogin = !!JSON.parse(process.env.OPENAI_IS_GOOGLE_LOGIN);
} else {
  questions.push({
    name: 'isGoogleLogin',
    message: 'Is this a Google login?',
    type: 'confirm',
    default: false,
  });
}

if (questions.length > 0) {
  Object.assign(credentials, await inquirer.prompt(questions));
}

console.log('Launching browser for ChatGPT session...');
const client = new ChatGPTAPIBrowser(credentials);
await client.initSession();

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/query', async (req, res) => {
  if (typeof req.body !== 'object' || !req.body) {
    res.status(400).json({ error: 'Request must be a JSON object' });
    return;
  }
  if (typeof req.body.prompt !== 'string') {
    res.status(400).json({ error: 'Request must include string key "prompt"' });
    return;
  }

  const options = {};
  if (req.body.conversationId) {
    options.conversationId = req.body.conversationId;
  }
  if (req.body.parentMessageId) {
    options.parentMessageId = req.body.parentMessageId;
  }

  const prompt = req.body.prompt;
  console.log('<', options, prompt);
  let result;
  try {
    result = await client.sendMessage(req.body.prompt, options);
  } catch (error) {
    if (error instanceof ChatGPTError) {
      console.error('ChatGPT error:', error);
      res.status(500).json({ error: error.message });
      return;
    }
  }
  console.log('>', result);
  res.json({
    response: result.response,
    conversationId: result.conversationId,
    messageId: result.messageId,
  });
});

const host = Object.hasOwn(process.env, 'CHATGPT_RELAY_SERVER_HOST')
  ? process.env.CHATGPT_RELAY_SERVER_HOST
  : '127.0.0.1';
const port = Object.hasOwn(process.env, 'CHATGPT_RELAY_SERVER_PORT')
  ? JSON.parse(process.env.CHATGPT_RELAY_SERVER_PORT)
  : 3000;
const server = app.listen(port, host, () => {
  const address = server.address();
  console.log(`Server listening on http://${address.address}:${address.port}`);
});
