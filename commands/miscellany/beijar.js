const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const KISS_GIFS = [
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGFjZmd1MmYyMWsyZnlqOW5vZTI4Y3FzZzd2OGhka2RrNmJlaWVlZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XZYxeRlIEdmKI/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTBzMG1lbzJxbmJ2bWxhbjg2cWkxazA5bnl6OWJpODduOXBvc2FxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11rWoZNpAKw8w/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExODE1cmJqZGV6aGR1aWQ1eWgyZGkxcWtqdjQzcnI5c2lwOWFkdzd1eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/12VXIxKaIEarL2/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Jud3F0YXRlOWxoeGwwNjR3cDN2ZjVidzBoY3l3bGM0NDVxcW82eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FqBTvSNjNzeZG/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmppYTJzMTRlcGZrZ291eTNrc2s1OHNnejN1cWxyem92bzMzb243dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f82EqBTeCEgcU/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExazAxM2Y4eXdrcGJ3NG9wbHhhY3RidTVqZ2M2N3l6eHBvMnRhZXM3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WynnqxhdFEPYY/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjJuZGFudzV4c282ODNldWE5bW5jZHptNjAwMzd2dnNjNzdjOTlxayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zkppEMFvRX5FC/giphy.gif'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beijar')
        .setDescription('Dê um beijo em alguém!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Quem você quer beijar?')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user');
        const senderUser = interaction.user;

        const senderMember = await interaction.guild.members.fetch(senderUser.id);
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        const senderDisplayName = senderMember.displayName;
        const targetDisplayName = targetMember.displayName;

        if (targetUser.id === senderUser.id) {
            await interaction.editReply({ content: 'Você não pode se beijar... **IDIOTA!!**', ephemeral: true });
            return;
        }

        const randomGif = KISS_GIFS[Math.floor(Math.random() * KISS_GIFS.length)];

        const embed = new EmbedBuilder()
            .setColor('#FFB6C1')
            .setTitle(`${senderDisplayName} deu um beijão em ${targetDisplayName}!`)
            .setImage(randomGif)
            .setFooter({ text: 'Clique no botão abaixo para devolver o beijo.' });

        const kissButton = new ButtonBuilder()
            .setCustomId('return_kiss')
            .setLabel('Devolver o Beijo 💖')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(kissButton);

        let message;
        try {
            message = await interaction.editReply({
                embeds: [embed],
                components: [actionRow]
            });
        } catch (error) {
            console.error('Erro ao enviar a mensagem inicial:', error);
            return;
        }

        const filter = (i) => i.customId === 'return_kiss' && i.user.id === targetUser.id;

        const collector = message.createMessageComponentCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async (i) => {
            const returnGif = KISS_GIFS[Math.floor(Math.random() * KISS_GIFS.length)]; 
            const returnEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle(`${targetDisplayName} devolveu o beijo para ${senderDisplayName}!`)
                .setImage(returnGif);

            try {
                await interaction.followUp({
                    embeds: [returnEmbed]
                });
            } catch (error) {
                console.error('Erro ao tentar enviar a nova mensagem:', error);
            }
        });

        collector.on('end', async (collected) => {
            try {
                if (collected.size === 0) {
                    await message.edit({ components: [] });
                }
            } catch (error) {
                console.error('Erro ao tentar editar a mensagem após o fim do coletor:', error);
            }
        });
    }
};
