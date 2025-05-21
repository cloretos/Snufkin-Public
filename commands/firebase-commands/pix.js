const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebase');


function formatCurrency(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pix')
        .setDescription('Faça um pix para outra pessoa.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Pessoa para enviar o pix...')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('valor')
                .setDescription('Valor para transferir...')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const destinatario = interaction.options.getUser('user');
        const quantidade = interaction.options.getInteger('valor');
        const remetenteId = interaction.user.id;
        const destinatarioId = destinatario.id;

        if (remetenteId === destinatarioId) {
            await interaction.editReply({ content: 'Não quero, IMUNDICE!', ephemeral: true });
            return;
        }

        async function getUserData(userId) {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            return doc.exists ? doc.data() : { 'murof credits': 0 };
        }

        try {
            const remetenteData = await getUserData(remetenteId);
            const destinatarioData = await getUserData(destinatarioId);

            if (remetenteData['murof credits'] < quantidade) {
                await interaction.editReply({ content: 'Você nem tem essa quantidade de credits, **POBRE!!**', ephemeral: true });
                return;
            }

            const newRemetenteCredits = remetenteData['murof credits'] - quantidade;
            await db.collection('users').doc(remetenteId).set({
                'murof credits': newRemetenteCredits,
            }, { merge: true });

            const newDestinatarioCredits = destinatarioData['murof credits'] + quantidade;
            await db.collection('users').doc(destinatarioId).set({
                'murof credits': newDestinatarioCredits,
            }, { merge: true });

            await interaction.editReply({ content: `*${interaction.user} enviou M$ ${formatCurrency(quantidade)},00 Murof credits para ${destinatario}...*` });

            console.log(`${interaction.user.username} enviou ${formatCurrency(quantidade)} Murof Credits para ${destinatario.username}.`);
        } catch (error) {
            console.error('Erro ao acessar o Firestore:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao tentar realizar a transferência.', ephemeral: true });
        }
    }
};
