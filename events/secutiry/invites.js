const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { token, guildId } = require('../../config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const exemptRoleIds = ['ROLE_ID1', 'ROLE_ID2']; // IDs de cargos que podem enviar convites.
const exemptLinks = ['NONE', 'NONE']; // Links de servidores permitidos.
const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/([A-Za-z0-9]+)/i;

client.on('messageCreate', async (message) => {
    if (!message.guild || message.guild.id !== guildId) return;

    const links = message.content.match(/(https?:\/\/[^\s]+|discord\.gg\/[^\s]+)/g);
    if (!links) return;

    const member = message.member;
    const hasExemptRole = member.roles.cache.some(role => exemptRoleIds.includes(role.id));
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isBot = message.author.bot;

    if (isAdmin || hasExemptRole) return;

    for (const link of links) {
        if (exemptLinks.includes(link)) continue;

        const isInvite = inviteRegex.test(link);
        if (!isInvite) continue;

        let isFromThisServer = false;

        try {
            const invite = await client.fetchInvite(link);
            isFromThisServer = invite.guild?.id === message.guild.id;
        } catch (err) {
            console.error(`Erro ao buscar informações do convite: ${err.message}`);
        }

        if (!isFromThisServer) {
            await deleteMessage(message, link);
        }
    }
});

async function deleteMessage(message, link) {
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        console.log('Permissão negada para apagar mensagens.');
        return;
    }

    try {
        await message.delete();
        console.log(`Mensagem com convite externo apagada: ${link}`);
    } catch (err) {
        console.error(`Erro ao apagar a mensagem com o link ${link}: ${err.message}`);
    }
}

client.login(token);
