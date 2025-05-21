const { guildId, goodbyeID, logChannelId } = require('../../config.json');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        if (member.guild.id !== guildId) return;

        const farewellChannel = member.guild.channels.cache.get(goodbyeID) || await member.guild.channels.fetch(goodbyeID);
        if (!farewellChannel) return;

        const infoChannel = member.guild.channels.cache.get(logChannelId);
        if (!infoChannel) return;

        const nickname = member.nickname || member.user.username;
        const farewellMessage = `Não sentiremos sua falta, ${nickname}!`;

        try {
            await farewellChannel.send(farewellMessage);

            const memberInfo = `Membro saiu: <@${member.id}> (${member.user.tag})\nID: ${member.id}\nSaiu em: ${new Date().toLocaleString()}`;
            await infoChannel.send(memberInfo);

        } catch (error) {
            console.error('[WARNING] [GOODBYE]', error);
        }
    },
};
