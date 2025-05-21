const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const db = require('../../firebase/firebase');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const config = JSON.parse(fs.readFileSync('config.json'));
const token = config.token;

const levels = {
    5: '1352880772880666695',
    10: '1352880773816127570',
    20: '1352880775598571570',
    30: '1352880776634695682',
    40: '1352880778673131593',
    50: '1352880780442992740',
    60: '1352880781848215572',
    70: '1352880783064567849',
    80: '1352880784423518329',
    100: '1352880785807638569',
};

const rankRoles = Object.values(levels);
let xpCooldown = new Set();

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild.id !== config.guildId) return; 

    const userId = message.author.id;
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    let userXP = doc.exists ? doc.data() : { xp: 0, level: 0, messageCount: 0 };

    userXP.messageCount += 1;

    if (xpCooldown.has(userId)) return;

    xpCooldown.add(userId);
    setTimeout(() => {
        xpCooldown.delete(userId);
    }, 5000);

    userXP.xp += Math.floor(Math.random() * 15) + 8;
    const currentLevel = Math.floor(userXP.xp / 1000);

    userXP.level = currentLevel || 0;

    if (currentLevel > userXP.level) {
        userXP.level = currentLevel;

        if (levels[userXP.level]) {
            let roleId = levels[userXP.level];
            let role = message.guild.roles.cache.get(roleId);

            rankRoles.forEach(rankRoleId => {
                if (message.member.roles.cache.has(rankRoleId)) {
                    message.member.roles.remove(rankRoleId).catch(console.error);
                }
            });

            if (role) {
                await message.member.roles.add(role).catch(console.error);
                message.channel.send(`Parabéns ${message.author}, você subiu para o nível ${userXP.level}!! <a:hackerbongocat:1352101410564735066>`);
            }
        }
    }

    await userRef.set({
        xp: userXP.xp,
        level: userXP.level,
        messageCount: userXP.messageCount
    }, { merge: true });
});

client.login(token);
