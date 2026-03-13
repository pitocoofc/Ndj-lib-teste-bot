// Importando a classe da biblioteca instalada via GitHub
import { EasyBot } from 'ndj-lib';

const bot = new EasyBot({
    // Removi as aspas para que o Node leia a variável de ambiente do Render
    token: process.env.DISCORD_TOKEN 
});

// Configurações globais
bot.config = {
    ownerId: '1448096319372656703', 
    messagespam: 5,                   
    limitmessagespam: 15              
};

// Carregamento dos módulos
bot.useModule('dnt-teste');
bot.useModule('dnt-economy');
bot.useModule('dnt-ia');
bot.useModule('dnt-comunity');
bot.useModule('dnt-gt');
bot.useModule('ndj-security');
bot.useModule('dnt-conf');
bot.useModule('Dnt-search');
bot.useModule('dnt-embed');

// Inicialização com tratamento de erro
bot.start().then(() => {
    console.log("Bot online com sucesso!");
}).catch(err => {
    console.error("Erro fatal no bot:", err);
});
