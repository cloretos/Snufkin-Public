const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { logChannelId } = require('../../config.json');

const SPAM_CONFIG = {
  maxMessages: 5,
  timeFrame: 6000, 
  muteDuration: 300000, 
  repeatedMessagesThreshold: 4, 
  repeatedLinksThreshold: 5, 
  maxMentions: 5, 
  maxAttachments: 10, 
  warningBeforeMute: true, 
};

const userMessages = new Collection();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on('messageCreate', async (message) => {
  if (!message.guild) return;
  if (message.author.id === client.user.id) return; 

  const { author, content, guild, channel, attachments } = message;
  const now = Date.now();

  if (!userMessages.has(author.id)) {
    userMessages.set(author.id, []);
  }
  const messages = userMessages.get(author.id);

  messages.push({ content, timestamp: now });
  userMessages.set(author.id, messages.filter(msg => now - msg.timestamp < SPAM_CONFIG.timeFrame));

  if (messages.length > SPAM_CONFIG.maxMessages) {
    await handleSpam(guild, author, channel, 'Excesso de mensagens em curto período.');
    return;
  }

  const repeatedMessagesCount = messages.filter(msg => msg.content === content).length;
  if (repeatedMessagesCount >= SPAM_CONFIG.repeatedMessagesThreshold) {
    await handleSpam(guild, author, channel, 'Mensagens repetitivas detectadas.');
    return;
  }

  const links = messages.flatMap(msg => (msg.content.match(/https?:\/\//g) || []));
  if (links.length >= SPAM_CONFIG.repeatedLinksThreshold) {
    await handleSpam(guild, author, channel, 'Muitos links enviados.');
    return;
  }

  const mentionCount = message.mentions.users.size + message.mentions.roles.size;
  if (mentionCount > SPAM_CONFIG.maxMentions) {
    await handleSpam(guild, author, channel, 'Menções excessivas.');
    return;
  }

  if (attachments.size > SPAM_CONFIG.maxAttachments) {
    await handleSpam(guild, author, channel, 'Anexos em excesso.');
    return;
  }
});

async function handleSpam(guild, user, channel, reason) {
  try {
    const member = await guild.members.fetch(user.id).catch(() => null);
    const punishmentChannel = guild.channels.cache.get(logChannelId);
    if (!member) return;

    if (!member.moderatable) {
      console.warn(`Tentativa de punir usuário com cargo superior ou igual: ${user.tag}`);
      return;
    }

    if (SPAM_CONFIG.warningBeforeMute) {
      await channel.send(`${user}, SHUT UP NOW!`);
    }

    setTimeout(async () => {
      if (member) {
        await member.timeout(SPAM_CONFIG.muteDuration, reason);

        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Punição Aplicada')
          .setDescription(`**Usuário:** ${user.tag}\n**Motivo:** ${reason}\n**Duração:** 5 minutos`)
          .setThumbnail(user.displayAvatarURL())
          .setFooter({ text: `Punido em ${new Date().toLocaleString()}` });

        if (punishmentChannel) punishmentChannel.send({ embeds: [embed] });
      }
    }, 3000);

    userMessages.delete(user.id);
  } catch (error) {
    console.error(`Erro ao aplicar punição para ${user.tag}:`, error);
  }
}

client.login(config.token);
