const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa um número específico de mensagens no chat.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de mensagens a serem apagadas...')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'Você não tem permissão para apagar mensagens.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('quantidade');

        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `Apaguei ${amount} mensagens.`, ephemeral: true });
        } catch (error) {
            console.error('Erro ao limpar mensagens:', error);
            await interaction.reply({ content: 'Ocorreu um erro ao tentar apagar as mensagens.', ephemeral: true });
        }
    },
};
