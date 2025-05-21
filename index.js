const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { clientId, token  } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commands = [];
const cooldowns = new Collection();

const loadCommands = (folder) => {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', folder, file));
        if (command.data && command.execute) {
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] O comando em ${file} está faltando a propriedade "data" ou "execute".`);
        }
    }
};

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
    loadCommands(folder);
}

const loadedEvents = new Set();
const loadEvents = (directory) => {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            loadEvents(filePath);
        } else if (file.endsWith('.js')) {
            const event = require(filePath);
            if (!loadedEvents.has(event.name)) {
                loadedEvents.add(event.name);
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            }
        }
    }
};

loadEvents(path.join(__dirname, 'events'));

const rest = new REST({ version: '10' }).setToken(token);

async function registerGlobalCommands() {
    try {
        console.log(`Atualizando ${commands.length} comandos...`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        console.log(`Comandos registrados com sucesso: ${data.length}.`);
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
}

(async () => {
    await registerGlobalCommands();  
})();

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
        return;
    }

    const now = Date.now();
    const cooldownAmount = (command.cooldown || 5) * 1000;

    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const timestamps = cooldowns.get(command.data.name);
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (timestamps.has(interaction.user.id)) {
        if (now < expirationTime) {
            return;
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Erro ao executar o comando:', error);
        const response = { content: 'Hmm... não consegui executar esse comando.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
        } else {
            await interaction.reply(response);
        }
    }
});

client.login(token);
