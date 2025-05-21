const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('descrição')
        .setDescription('Adicione uma descrição no seu perfil.')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('Adicione seu texto...')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const descricao = interaction.options.getString('texto');
        const userId = interaction.user.id;

        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.set({ 'descri': descricao }, { merge: true });

            await interaction.editReply({ content: 'Descrição registrada com sucesso!', ephemeral: true });
        } catch (error) {
            console.error('Erro ao acessar o Firestore:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao tentar registrar sua descrição.', ephemeral: true });
        }
    }
};