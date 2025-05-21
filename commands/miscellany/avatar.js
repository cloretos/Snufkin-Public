const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Visualizar seu avatar, ou de outra pessoa.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User para mostrar o avatar...')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const userName = member.displayName || user.username;

        let avatarUrl = member.displayAvatarURL({ dynamic: true, size: 1024 });

        if (avatarUrl.endsWith('.png')) {
            avatarUrl = avatarUrl.replace(/\.webp$/, '.png');
        }

        const downloadUrl = avatarUrl.replace(/\.webp$/, '.png'); 

        const avatarEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(`${userName}'s Avatar`)
            .setDescription(`[Clique aqui para baixar o avatar](<${downloadUrl}>)`) 
            .setImage(avatarUrl)
            .setFooter({
                text: `MUROF OPERATING SYSTEMS`,
            })
            .setTimestamp();

        if (avatarUrl) {
            await interaction.editReply({ embeds: [avatarEmbed] });
        } else {
            await interaction.editReply(`Não consegui achar o avatar de ${userName}.`);
        }
    }
};