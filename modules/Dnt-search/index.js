const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

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

    // NÍVEL 1: Busca o TXT no seu GitHub Raw
    async getInfo(tema) {
        const cleanKey = tema.toLowerCase().trim().replace(/\s+/g, '_');
        const url = `https://raw.githubusercontent.com/${this.user}/${this.repo}/${this.branch}/${cleanKey}.txt`;
        
        try {
            const res = await fetch(url);
            return res.ok ? await res.text() : null;
        } catch (e) {
            return null;
        }
    }

    // NÍVEL 2: Busca na DBpedia (Conhecimento Global)
    async fetchGlobalData(query) {
        const url = `https://lookup.dbpedia.org/api/search?query=${encodeURIComponent(query)}&format=json`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.docs && data.docs.length > 0 ? data.docs[0].comment : null;
        } catch (e) {
            return null;
        }
    }

    iniciar() {
        this.client.on('ready', () => {
            console.log(`✅ Ndj-lib Conectada! Bot: ${this.client.user.tag}`);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.content.startsWith('!saber')) return;

            const termo = message.content.split(' ').slice(1).join(' ');
            if (!termo) return message.reply("Digite algo para buscar! Ex: `!saber xadrez`.");

            try {
                // TENTA NÍVEL 1: GITHUB
                const conteudo = await this.getInfo(termo);

                if (conteudo) {
                    const embed = new EmbedBuilder()
                        .setTitle(`📖 Biblioteca: ${termo.toUpperCase()}`)
                        .setDescription(conteudo)
                        .setColor('#2b2d31')
                        .setFooter({ text: 'Fonte: Banco de Dados Próprio (GitHub)' });

                    return message.reply({ embeds: [embed] });
                }

                // TENTA NÍVEL 2: DBPEDIA
                const fallbackTexto = await this.fetchGlobalData(termo);

                if (fallbackTexto) {
                    const embedGlobal = new EmbedBuilder()
                        .setTitle(`🌐 Conhecimento Global: ${termo}`)
                        .setDescription(fallbackTexto.slice(0, 2048))
                        .setColor('#5865F2')
                        .setFooter({ text: 'Fonte: DBpedia/Wikipedia' });

                    return message.reply({ embeds: [embedGlobal] });
                }

                message.reply('❌ Não encontrei nada sobre isso em nenhuma das minhas bases.');

            } catch (error) {
                console.error("Erro na busca:", error);
                message.reply('⚠️ Erro ao processar a consulta.');
            }
        });

        this.client.login(this.token);
    }
}

module.exports = NdjLibrary;
