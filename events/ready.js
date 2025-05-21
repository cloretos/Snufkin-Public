const { Events } = require('discord.js');
const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const status = [
    "paint THE sky - Lil Yachty",
    ":(failure(: - Lil Yachty",
    "IVE OFFICIALLY LOST ViSiON!!!! - Lil Yachty",
    "Flutter is an open source framework developed and supported by Google",
    "SUPER TUESDAY! - JPEGMAFIA",
    "can i have nitrus today",
    "gritos de desespero",
    "I WANT TO LIVE MY LIFE AGAIN",
    "Access https://murof.org/ Now!!",
    "Quer trocar a cor do seu nick? Experimente /cor...",
    "Use /daily para resgatar seus Murof Sparks!",
    "I LOVE YOU LIKE KANYE LOVES NITROUS",
];

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        function updateStatus() {
            const statusAleatorio = status[Math.floor(Math.random() * status.length)];
            client.user.setPresence({
                activities: [
                    {
                        name: statusAleatorio,
                        type: ActivityType.Listening, 
                    }
                ],
                status: PresenceUpdateStatus.Online, 
            });
        }
        updateStatus();

        setInterval(updateStatus, 600000);

        console.log(`BOTTING SYSTEM SNUFKIN SKYNET`);
    },
};
