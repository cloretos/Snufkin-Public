const { SlashCommandBuilder } = require('@discordjs/builders');

const userFails = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('girarmoeda')
        .setDescription('Gire a moeda e defina seu destino de merda!')
        .addStringOption(option => 
            option.setName('lado')
                .setDescription('Escolha cara ou coroa...')
                .setRequired(true)
                .addChoices(
                    { name: 'Cara', value: 'cara' },
                    { name: 'Coroa', value: 'coroa' }
                )),
    
    async execute(interaction) {
        const ladoEscolhido = interaction.options.getString('lado');
        const resultadoMoeda = Math.random() < 0.5 ? 'cara' : 'coroa';
        const userId = interaction.user.id;

        let errosConsecutivos = userFails.get(userId) || 0;

        if (ladoEscolhido === resultadoMoeda) {
            userFails.set(userId, 0);
            return interaction.reply(`*WAAA...* A moeda caiu **${resultadoMoeda}** e você acertou!`);
        } else {
            errosConsecutivos += 1;
            userFails.set(userId, errosConsecutivos);

            let muteDuration = 60 * Math.pow(2, errosConsecutivos - 1);
            muteDuration = Math.min(muteDuration, 3600); 

            const member = interaction.guild.members.cache.get(interaction.user.id);

            if (member && member.moderatable) {
                try {
                    await member.timeout(muteDuration * 1000, 'Errou o lado da moeda');
                    return interaction.reply(`MUAHAHAHA! A moeda caiu **${resultadoMoeda}**. *Você foi mutado por ${muteDuration / 60} minuto(s).*`);
                } catch (error) {
                    console.error('Erro ao mutar o membro:', error);
                    return interaction.reply({ content: 'O bot não tem permissões para mutar este usuário.', ephemeral: true });
                }
            } else {
                return interaction.reply(`*WAAA...* A moeda caiu **${resultadoMoeda}** e você acertou!`);
            }
        }
    }
};
