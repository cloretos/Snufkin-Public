const admin = require('firebase-admin');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../firebase/firebase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cacaniquem')
        .setDescription('Tente a sorte na máquina de caça-níqueis!'),
    
    async execute(interaction) {
        await interaction.deferReply();

        const remetenteId = interaction.user.id;
        const custoPorJogada = 100; 
        
        const simbolos = ['🍒', '🍋', '🍊', '⭐', '💎', '🍉'];
        const rolo1 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const rolo2 = simbolos[Math.floor(Math.random() * simbolos.length)];
        const rolo3 = simbolos[Math.floor(Math.random() * simbolos.length)];

        async function getUserData(userId) {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            return doc.exists ? doc.data() : { 'murof credits': 0 };
        }

        try {
            const remetenteData = await getUserData(remetenteId);

            if (remetenteData['murof credits'] < custoPorJogada) {
                await interaction.editReply({ content: 'Você não tem créditos suficientes para girar a máquina.', ephemeral: true });
                return;
            }

            const chance = Math.random();
            let ganhou = false;
            let premio = 0;

            if (rolo1 === rolo2 && rolo2 === rolo3) {
                ganhou = true;
                premio = Math.floor(Math.random() * 15000) + 5000; 
            }

            const ajusteSaldo = ganhou ? premio - custoPorJogada : -custoPorJogada;

            await db.runTransaction(async (transaction) => {
                const remetenteRef = db.collection('users').doc(remetenteId);

                const destinatarioSnapshot = await destinatarioRef.get();
                if (!destinatarioSnapshot.exists) {
                    transaction.set(destinatarioRef, { 'murof credits': 0 });
                }

                transaction.update(remetenteRef, {
                    'murof credits': admin.firestore.FieldValue.increment(ajusteSaldo),
                });

                if (!ganhou) {
                    transaction.update(destinatarioRef, {
                        'murof credits': admin.firestore.FieldValue.increment(custoPorJogada),
                    });
                }
            });

            const embed = new EmbedBuilder()
                .setColor(0xff0000) 
                .setTitle('🎰 Máquina de Caça-Níqueis 🎰')
                .setDescription(`**Resultado:**\n${rolo1} | ${rolo2} | ${rolo3}`)
                .setFooter({ text: 'Boa sorte na próxima rodada!', iconURL: interaction.user.displayAvatarURL() });

            if (ganhou) {
                embed.addFields(
                    { name: 'Parabéns!', value: `Você ganhou **M$ ${premio},00** Murof Sparks!` }
                );
            } else {
                embed.addFields(
                    { name: 'TROUXA!', value: `Você perdeu **M$ ${custoPorJogada},00** Murof Sparks.` }
                );
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao acessar o Firestore:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao tentar acessar a máquina de caça-níqueis.', ephemeral: true });
        }
    }
};