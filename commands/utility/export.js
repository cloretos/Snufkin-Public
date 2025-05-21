const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { guildId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription('Lista todos os judas do servidor em um .TXT'),
    async execute(interaction) {
        if (interaction.guild.id !== guildId) {
            return interaction.reply({ content: 'Uso exclusivo da MUROF!', ephemeral: true });
        }

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('Snufkin não quer trabalhar para você.');
        }

        try {
            const bannedUsers = await interaction.guild.bans.fetch();

            if (bannedUsers.size === 0) {
                return interaction.reply('Snufkin não achou ninguém banido :(');
            }

            let banList = 'Lista de usuários banidos:\n\n';
            bannedUsers.forEach(ban => {
                banList += `Usuário: ${ban.user.tag} (ID: ${ban.user.id})\nMotivo: ${ban.reason || 'Nenhum motivo especificado'}\n\n`;
            });

            const fileName = `banList_${interaction.guild.id}.txt`;
            fs.writeFileSync(fileName, banList, 'utf8');

            await interaction.reply({
                content: 'Aqui uma lista recheada de Judas!!',
                files: [{
                    attachment: fileName,
                    name: fileName,
                }],
            });
        } catch (error) {
            console.error('Snufkin não conseguiu buscar a lista de bans:', error);
            await interaction.reply('Snufkin não conseguiu buscar a lista de bans.');
        }
    },
};
