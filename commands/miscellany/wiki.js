const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wikipedia')
        .setDescription('Faça pesquisas no Wikipedia!')
        .addStringOption(option =>
            option.setName('pesquisa')
                .setDescription('O que você quer pesquisar no Wikipedia?')
                .setRequired(true)),

    async execute(interaction) {
        const pesquisa = interaction.options.getString('pesquisa');
        await interaction.deferReply();

        try {
            // Buscar resumo da página no Wikipedia
            const resumoResponse = await axios.get(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pesquisa)}`);

            if (resumoResponse.status === 200 && resumoResponse.data.extract) {
                const { extract } = resumoResponse.data;
                await interaction.editReply(extract);
                return;
            }

            // Se resumo não encontrado, buscar páginas relacionadas
            console.log("Página exata não encontrada, tentando sugestões...");
            const relatedResponse = await axios.get(`https://pt.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(pesquisa)}`);

            if (relatedResponse.status === 200 && relatedResponse.data.pages && relatedResponse.data.pages.length > 0) {
                const suggestion = relatedResponse.data.pages[0];
                const { extract } = suggestion;

                await interaction.editReply(extract);
                return;
            }

            // Caso nenhuma informação seja encontrada
            await interaction.editReply('Não consegui encontrar informações sobre isso no Wikipedia. Por favor, tente ser mais específico!');
        } catch (error) {
            console.error('Erro ao buscar no Wikipedia:', error);
            await interaction.editReply('Ocorreu um erro ao tentar buscar informações no Wikipedia. Tente novamente mais tarde.');
        }
    },
};