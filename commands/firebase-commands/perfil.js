const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../firebase/firebase');

async function getUserData(userId) {
    try {
        const docRef = db.collection('users').doc(userId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            return {
                murofCredits: isNaN(data['murof credits']) ? 0 : data['murof credits'],
                xp: isNaN(data.xp) ? 0 : data.xp,
                level: isNaN(data.level) ? 0 : data.level,
                descri: data.descri || '',
            };
        }
        return { murofCredits: 0, xp: 0, level: 0, descri: ''};
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return { murofCredits: 0, xp: 0, level: 0, descri: ''};
    }
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Mostra o seu perfil, ou de outra pessoa.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Pessoa para ver o perfil...')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);
        if (!member) {
            return interaction.followUp({ content: 'Membro não encontrado...', ephemeral: true });
        }

        let userMurofCredits = 0;
        let userXP = 0;
        let userLevel = 0;
        let userDescri = '';
        let userParceiro = null;

        try {
            const userData = await getUserData(member.id);
            userMurofCredits = userData.murofCredits;
            userXP = userData.xp;
            userLevel = userData.level;
            userDescri = userData.descri;
            userParceiro = userData.parceiro;
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
        }

        const displayName = member.displayName;
        const highestRole = member.roles.highest;
        const joinedDate = member.joinedAt ? member.joinedAt.toLocaleDateString('pt-BR') : 'Desconhecido';

        const profileEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(`${displayName}`)
            .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Murof Sparks', value: `M$ ${formatCurrency(userMurofCredits)},00`, inline: false },
                { name: 'Hierarquia', value: highestRole ? highestRole.name : 'Non-persons', inline: true },
                { name: 'XP & Nível', value: `XP: ${userXP} | Nível: ${userLevel}`, inline: true },
                { name: 'Entrou aqui', value: joinedDate, inline: true }
            );

        if (userDescri) {
            profileEmbed.addFields({ name: 'Descrição', value: userDescri, inline: false });
        }

        profileEmbed.setFooter({ text: `MUROF OPERATING SYSTEMS | ID: ${member.id}` })
            .setTimestamp();

        await interaction.followUp({ embeds: [profileEmbed] });
    }
};