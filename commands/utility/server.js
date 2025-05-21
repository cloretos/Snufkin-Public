const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Exibe informações sobre o servidor.'),
    async execute(interaction) {
        const { guild, member } = interaction;

        const owner = await guild.fetchOwner();
        const totalMembers = guild.memberCount;
        const creationDate = guild.createdAt;
        const creationDateFormatted = creationDate.toLocaleDateString('pt-BR'); 

        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - creationDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = Math.floor(diffDays / 365);
        const diffMonths = Math.floor((diffDays % 365) / 30);

        let serverAge = '';
        if (diffYears > 0) {
            serverAge += `${diffYears} ano${diffYears > 1 ? 's' : ''} `;
        }
        if (diffMonths > 0) {
            serverAge += `${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`;
        }
        if (serverAge === '') {
            serverAge = 'Menos de um mês';
        }

        const boostLevel = guild.premiumTier ? `Nível ${guild.premiumTier}\n(${guild.premiumSubscriptionCount} Boosts)` : 'Nenhum';
        const bannerURL = guild.bannerURL({ size: 1024 });

        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'ID do Servidor', value: guild.id, inline: true },
                { name: 'Dono', value: `${owner.user.tag} (ID: ${owner.id})`, inline: false },
                { name: 'Data de Criação', value: `${creationDateFormatted}\n(${serverAge})`, inline: true },
                { name: 'Total de Membros', value: `${totalMembers}`, inline: true },
                { name: 'Nível de Boost', value: boostLevel, inline: true }
            )
            .setFooter({ text: `MUROF OPERATING SYSTEMS | ID: ${member.id}` })
            .setTimestamp();

        if (bannerURL) {
            embed.setImage(bannerURL);
        }

        await interaction.reply({ embeds: [embed] });
    }
};