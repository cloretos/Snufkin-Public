const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const HUG_GIFS = [
    'https://media.giphy.com/media/3bqtLDeiDtwhq/giphy.gif',
    'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
    'https://media.giphy.com/media/5eyhBKLvYhafu/giphy.gif',
    'https://media.giphy.com/media/sUIZWMnfd4Mb6/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJiZHpydTJqazJkdmt1eWhsdGZqMGRpNmJ1aTdtdHYxMXZ5bDR1ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wSY4wcrHnB0CA/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExenk5dmRkMzNzanFqcm9jbHc1NW1hZm1oNDlia3ZlMjV5cWpmZ29iaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5eyhBKLvYhafu/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnNja3N1Zjl5bXc3MmV6ZHFwbm10dWpzM3ExMjdhdXJkcXphNGUwYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/svXXBgduBsJ1u/giphy.gif',
    'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXVxeTB4aHl3YWR4NHVndjQ0bDB3bDB3YTk4b2Nha3Zvb2V5NGdxdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kvKFM3UWg2P04/giphy.gif'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abraçar')
        .setDescription('Dê um abraço em alguém!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Quem você quer abraçar?')
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
            await interaction.editReply({ content: 'Você não pode se abraçar... **IDIOTA!!**', ephemeral: true });
            return;
        }

        const randomGif = HUG_GIFS[Math.floor(Math.random() * HUG_GIFS.length)];

        const embed = new EmbedBuilder()
            .setColor('#FFB6C1')
            .setTitle(`${senderDisplayName} deu um abraço em ${targetDisplayName}!`)
            .setImage(randomGif)
            .setFooter({ text: 'Clique no botão abaixo para devolver o abraço.' });

        const hugButton = new ButtonBuilder()
            .setCustomId('return_hug')
            .setLabel('Devolver o Abraço 💖')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(hugButton);

        const message = await interaction.editReply({
            embeds: [embed],
            components: [actionRow]
        });

        const filter = (i) => i.customId === 'return_hug' && i.user.id === targetUser.id;

        const collector = message.createMessageComponentCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async (i) => {
            const returnGif = HUG_GIFS[Math.floor(Math.random() * HUG_GIFS.length)];
            const returnEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle(`${targetDisplayName} devolveu o abraço para ${senderDisplayName}!`)
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
