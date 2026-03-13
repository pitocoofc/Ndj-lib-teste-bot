const { Client, GatewayIntentBits, EmbedBuilder } = import('discord.js');

class NdjLibrary {
    constructor(config) {
        this.token = config.token;
        this.user = config.githubUser || 'pitocoofc';
        this.repo = config.githubRepo || 'banco';
        this.branch = config.branch || 'main';

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
    }

    async getInfo(tema) {
        const cleanKey = tema.toLowerCase().trim().replace(/\s+/g, '_');
        const url = `https://raw.githubusercontent.com/${this.user}/${this.repo}/${this.branch}/${cleanKey}.txt`;

        try {
            const res = await fetch(url);
            return res.ok ? await res.text() : null;
        } catch (e) {
            console.error("Erro ao buscar info:", e);
            return null;
        }
    }

    iniciar() {
        this.client.on('ready', () => {
            console.log(`✅ Ndj-lib Conectada! Bot: ${this.client.user.tag}`);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if (!message.content.startsWith('!saber ')) return;

            const termo = message.content.split(' ').slice(1).join(' ');
            if (!termo) return message.reply("O que você deseja saber?");

            const conteudo = await this.getInfo(termo);

            if (conteudo) {
                const embed = new EmbedBuilder()
                    .setTitle(`📖 Ndj-Lib | ${termo.toUpperCase()}`)
                    .setDescription(conteudo.slice(0, 4096))
                    .setColor('#2b2d31')
                    .setFooter({ text: `Fonte: github.com/${this.user}/${this.repo}` });

                return message.reply({ embeds: [embed] });
            }

            message.reply("❌ Termo não encontrado no banco de dados.");
        });

        this.client.login(this.token);
    }
}

module.exports = NdjLibrary;
