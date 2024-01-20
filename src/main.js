import dotenv from 'dotenv'
dotenv.config()

import loadEvents from "./handlers/eventHandler.js";
import loadCommands from './handlers/slashCommands.js';
import { setupMongoose } from "./utils.js";

const { TOKEN: token, MONGO_URL: mongoUrl } = process.env;

import { Client, GatewayIntentBits, Collection } from "discord.js";
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.commands = new Collection();

client.login(token).then(() => {
  setupMongoose(mongoUrl);
  loadEvents(client);
  loadCommands(client);
});