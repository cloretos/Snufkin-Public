const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token, guildId, logChannelId } = require('../../config.json');
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.on('messageDelete', async (message) => {
    if (message.guild.id !== guildId || !message.content || message.author.bot) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const member = await message.guild.members.fetch(message.author.id);
    const nickname = member.nickname || message.author.username;

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Mensagem Apagada')
        .addFields(
            { name: 'Autor', value: `${nickname} (ID: ${message.author.id})`, inline: true },
            { name: 'Conteúdo da Mensagem', value: message.content || 'Sem conteúdo', inline: false },
            { name: 'Canal', value: `<#${message.channel.id}> (ID: ${message.channel.id})`, inline: true },
            { name: 'Data', value: new Date().toLocaleString(), inline: true }
        );

    if (message.attachments.size > 0) {
        const attachmentLinks = message.attachments.map(attachment => attachment.url).join('\n');
        embed.addFields({ name: 'Anexos', value: attachmentLinks, inline: false });
    }

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erro ao enviar mensagem de log de exclusão:", error);
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.guild.id !== guildId || oldMessage.author.bot || !oldMessage.content || !newMessage.content || oldMessage.content === newMessage.content) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const member = await oldMessage.guild.members.fetch(oldMessage.author.id);
    const nickname = member.nickname || oldMessage.author.username;

    const embed = new EmbedBuilder()
        .setColor('#000000')
        .setTitle('Mensagem Editada')
        .addFields(
            { name: 'Autor', value: `${nickname} (ID: ${oldMessage.author.id})`, inline: true },
            { name: 'Mensagem Antiga', value: oldMessage.content || 'Sem conteúdo', inline: false },
            { name: 'Mensagem Nova', value: newMessage.content || 'Sem conteúdo', inline: false },
            { name: 'Canal', value: `<#${oldMessage.channel.id}> (ID: ${oldMessage.channel.id})`, inline: true },
            { name: 'Data', value: new Date().toLocaleString(), inline: true }
        );

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erro ao enviar mensagem de log de edição:", error);
    }
});

client.on('guildBanAdd', async (guild, user) => {
    if (guild.id !== guildId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const auditLogs = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD', limit: 1 });
    const banLog = auditLogs.entries.first();

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Membro Banido')
        .addFields(
            { name: 'Membro', value: `${user.username} (ID: ${user.id})`, inline: true },
            { name: 'Banido por', value: `${banLog.executor.username} (ID: ${banLog.executor.id})`, inline: true },
            { name: 'Motivo', value: banLog.reason || 'Não especificado', inline: false },
            { name: 'Data', value: new Date().toLocaleString(), inline: true }
        );

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erro ao enviar mensagem de log de banimento:", error);
    }
});

client.login(token);
