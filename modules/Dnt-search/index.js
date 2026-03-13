import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import path from 'path';

export class NdjLibrary {
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

        this.modules = new Map();
    }

    // MÉTODO NOVO: Responsável por carregar os módulos da pasta ./modules
    async useModule(moduleName) {
        try {
            // Tenta importar o arquivo .js ou a pasta/index.js
            // O "file://" é necessário para caminhos absolutos no Windows/Linux com ESM
            const modulePath = path.resolve(process.cwd(), 'modules', `${moduleName}.js`);
            const folderPath = path.resolve(process.cwd(), 'modules', moduleName, 'index.js');

            let module;
            try {
                module = await import(`file://${modulePath}`);
            } catch {
                module = await import(`file://${folderPath}`);
            }

            if (module && typeof module.init === 'function') {
                module.init(this);
                console.log(`✅ [DNT] Módulo '${moduleName}' carregado com sucesso.`);
            } else {
                console.error(`❌ [DNT] O módulo '${moduleName}' não possui a função export function init().`);
            }
        } catch (err) {
            console.error(`❌ [DNT] Erro ao carregar o módulo '${moduleName}':`, err.message);
        }
    }

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

    async start() {
        this.client.on('ready', () => {
            console.log(`✅ Ndj-lib Conectada! Bot: ${this.client.user.tag}`);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.content.startsWith('!saber')) return;

            const termo = message.content.split(' ').slice(1).join(' ');
            if (!termo) return message.reply("Digite algo para buscar!");

            try {
                const conteudo = await this.getInfo(termo);

                if (conteudo) {
                    const embed = new EmbedBuilder()
                        .setTitle(`📖 Biblioteca: ${termo.toUpperCase()}`)
                        .setDescription(conteudo)
                        .setColor('#2b2d31');
                    return message.reply({ embeds: [embed] });
                }

                const fallbackTexto = await this.fetchGlobalData(termo);
                if (fallbackTexto) {
                    const embedGlobal = new EmbedBuilder()
                        .setTitle(`🌐 Global: ${termo}`)
                        .setDescription(fallbackTexto.slice(0, 2048))
                        .setColor('#5865F2');
                    return message.reply({ embeds: [embedGlobal] });
                }

                message.reply('❌ Não encontrado.');
            } catch (error) {
                console.error(error);
            }
        });

        await this.client.login(this.token);
    }
                        }
