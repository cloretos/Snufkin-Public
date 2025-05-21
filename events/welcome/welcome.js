const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { guildId, welcomeID, roleMember, logChannelId } = require('../../config.json');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        if (member.guild.id !== guildId) return;

        const welcomeChannel = member.guild.channels.cache.get(welcomeID);
        if (!welcomeChannel) {
            console.error(`[ERROR] [WELCOME] Welcome channel not found: ${welcomeID}`);
            return;
        }

        const infoChannel = member.guild.channels.cache.get(logChannelId);
        if (!infoChannel) {
            console.error(`[ERROR] [WELCOME] Info channel not found: ${logChannelId}`);
            return;
        }

        const welcomeMessage = `Bem-vindo a Murof <@${member.id}>! Você é nosso ${member.guild.memberCount || 'novo'}º membro! <a:derpbounce:1204084743881359500>\n*Quer trocar a cor do seu nick? Experimente /cor...*`;

        const murof = new ButtonBuilder()
            .setLabel('murof.org')
            .setURL('https://murof.org/')
            .setStyle(ButtonStyle.Link);

        const drive = new ButtonBuilder()
            .setLabel('drive')
            .setURL('https://drive.google.com/drive/folders/1o7EtUPmdsgVeclJ8MUlxUFdr-_3xyKJW?usp=drive_link')
            .setStyle(ButtonStyle.Link);

        try {
            await welcomeChannel.send({
                content: welcomeMessage,
                components: [{ type: 1, components: [murof, drive] }],
            });
            console.log(`[INFO] [WELCOME] Sent welcome message for ${member.user.tag}`);

            const memberInfo = `Novo membro: <@${member.id}> (${member.user.tag})\nID: ${member.id}\nEntrou em: ${new Date().toLocaleString()}`;
            await infoChannel.send(memberInfo);
            console.log(`[INFO] [WELCOME] Sent member info for ${member.user.tag}`);

            const role = member.guild.roles.cache.get(roleMember);
            if (role) {
                await member.roles.add(role);
                console.log(`[INFO] [WELCOME] Role added to ${member.user.tag}: ${role.name}`);
            } else {
                console.error(`[WARNING] [WELCOME] [ROLES] Role not found: ${roleMember}`);
            }
        } catch (error) {
            console.error(`[ERROR] [WELCOME] An error occurred: ${error.message}`);
        }
    },
};
