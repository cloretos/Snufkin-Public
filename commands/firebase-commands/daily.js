const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

function formatCurrency(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Resgate Murof Sparks diários!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const userRef = admin.firestore().collection('users').doc(userId);

        let userData;
        try {
            const userDoc = await userRef.get();
            userData = userDoc.exists ? userDoc.data() : { 'murof credits': 0, level: 0, lastClaimed: null };

            if (isNaN(userData['murof credits']) || userData['murof credits'] < 0) {
                userData['murof credits'] = 0; 
                await userRef.update({ 'murof credits': 0 }); 
            }

        } catch (error) {
            console.error('Erro ao acessar o Firestore:', error);
            return interaction.editReply('Houve um erro ao tentar acessar seus dados. Tente novamente mais tarde.');
        }

        const now = Date.now();
        const cooldownPeriod = 24 * 60 * 60 * 1000;

        if (userData.lastClaimed && (now < userData.lastClaimed + cooldownPeriod)) {
            return interaction.editReply('Você já resgatou seus Murof Sparks hoje, **volte mais tarde!**');
        }

        const member = interaction.guild.members.cache.get(userId);
        let baseCredits = 1000; 
        let boosterBonus = 0;
        let levelBonus = 0;

        if (member && member.roles.cache.some(role => role.name === 'Server Booster')) {
            boosterBonus = baseCredits;
        }

        const userLevel = userData.level || 0;
        if (userLevel > 0) {
            levelBonus = userLevel * 50; 
        }
        const totalCredits = baseCredits + boosterBonus + levelBonus;

        if (isNaN(totalCredits)) {
            return interaction.editReply('Houve um erro ao calcular seus créditos. Tente novamente mais tarde.');
        }

        userData['murof credits'] += totalCredits;
        userData.lastClaimed = now;

        try {
            await userRef.set(userData, { merge: true });

            const embed = new EmbedBuilder()
                .setColor('#000000') 
                .setTitle(`${member.displayName}`) 
                .setDescription(`Você resgatou **M$ ${formatCurrency(totalCredits)},00 Murof Sparks!**`)
                .addFields(
                    { name: 'Base', value: formatCurrency(baseCredits), inline: true },
                    ...(boosterBonus > 0 ? [{ name: 'Booster', value: formatCurrency(boosterBonus), inline: true }] : []),
                    ...(levelBonus > 0 ? [{ name: `Bônus de Nível (${userLevel})`, value: formatCurrency(levelBonus), inline: true }] : [])
                )
                .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 1024 }))  
                .setFooter({ text: `MUROF OPERATING SYSTEMS | ID: ${member.id}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao atualizar os dados no Firestore:', error);
            return interaction.editReply('Houve um erro ao tentar resgatar seus Murof Credits. Tente novamente mais tarde.');
        }
    },
};
