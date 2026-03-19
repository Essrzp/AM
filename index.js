const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: 'ASTRA MARKET',
      type: ActivityType.Playing
    }],
    status: 'online'
  });
});

client.login(process.env.TOKEN);