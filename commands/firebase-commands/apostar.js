const admin = require('firebase-admin');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../firebase/firebase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apostar')
        .setDescription('Aposte um valor e teste sua sorte!')
        .addStringOption(option =>
            option.setName('valor')
                .setDescription('Valor para apostar... (ex.: 10.000)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const valorApostadoStr = interaction.options.getString('valor');
        const valorApostado = parseInt(valorApostadoStr.replace(/\./g, ''), 10);

        if (isNaN(valorApostado) || valorApostado <= 0) {
            await interaction.editReply({ content: 'Por favor, insira um valor válido para apostar.', ephemeral: true });
            return;
        }

        const remetenteId = interaction.user.id;

        async function getUserData(userId) {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            let userData = doc.exists ? doc.data() : { 'murof credits': 0 };

            if (isNaN(userData['murof credits']) || userData['murof credits'] < 0) {
                userData['murof credits'] = 0;
                await userRef.update({ 'murof credits': 0 });
            }
            return userData;
        }

        function formatarValor(valor) {
            return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        try {
            const remetenteData = await getUserData(remetenteId);

            if (remetenteData['murof credits'] < valorApostado) {
                await interaction.editReply({ content: 'Você não tem créditos suficientes para apostar.', ephemeral: true });
                return;
            }

            if (valorApostado < 1000) {
                await interaction.editReply({ content: 'O valor mínimo para apostar é de **M$ 1000,00** Murof Sparks.', ephemeral: true });
                return;
            }

            const chance = Math.random();
            let resultado, embed;

            if (chance < 0.40) {
                const multiplicador = parseFloat((Math.random() * (3.5 - 1.5) + 1.5).toFixed(2));
                resultado = Math.floor(valorApostado * multiplicador);

                await db.runTransaction(async (transaction) => {
                    const remetenteRef = db.collection('users').doc(remetenteId);
                    transaction.update(remetenteRef, {
                        'murof credits': admin.firestore.FieldValue.increment(resultado - valorApostado),
                    });
                });

                embed = new EmbedBuilder()
                    .setColor(0x32CD32)
                    .setTitle('Parabéns, você ganhou!')
                    .setDescription(`Você apostou **M$ ${formatarValor(valorApostado)},00** e ganhou **M$ ${formatarValor(resultado)},00** Murof Sparks!`)
                    .addFields({ name: 'Multiplicador', value: `**${multiplicador.toFixed(2)}x**` })
                    .setFooter({ text: 'Por que não apostar tudo agora?', iconURL: interaction.user.displayAvatarURL() });

            } else if (chance < 0.70) {
                resultado = Math.floor(valorApostado / 2);

                await db.runTransaction(async (transaction) => {
                    const remetenteRef = db.collection('users').doc(remetenteId);

                    transaction.update(remetenteRef, {
                        'murof credits': admin.firestore.FieldValue.increment(-resultado),
                    });
                    transaction.update(destinatarioRef, {
                        'murof credits': admin.firestore.FieldValue.increment(resultado),
                    });
                });

                embed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle('Metade da aposta!')
                    .setDescription(`Você perdeu **metade da aposta** e ficou com **M$ ${formatarValor(resultado)},00** Murof Sparks.`)
                    .setFooter({ text: 'Que tal tentar de novo?', iconURL: interaction.user.displayAvatarURL() });

            } else {
                resultado = 0;

                await db.runTransaction(async (transaction) => {
                    const remetenteRef = db.collection('users').doc(remetenteId);

                    transaction.update(remetenteRef, {
                        'murof credits': admin.firestore.FieldValue.increment(-valorApostado),
                    });
                    transaction.update(destinatarioRef, {
                        'murof credits': admin.firestore.FieldValue.increment(valorApostado),
                    });
                });

                embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('TROUXA, você perdeu tudo!')
                    .setDescription(`**M$ ${formatarValor(valorApostado)},00** Murof Sparks foram perdidos. Boa sorte na próxima!`)
                    .setFooter({ text: 'Você e tão azarado assim?', iconURL: interaction.user.displayAvatarURL() });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao acessar o Firestore:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao tentar realizar a aposta.', ephemeral: true });
        }
    }
};