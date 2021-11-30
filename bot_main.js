///neroなど無駄にメンテ性の良いクソコマンドたち
//点呼組分け
//名前置き換え機能


const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
//fs-extra
const fse = require('fs-extra');
const DEFAULT_DATA_PATH = __dirname + `/../burning_bot_data/`;

require('date-utils');


function json_defalt_read(jsonname, array) {
    try {
        array = JSON.parse(fse.readFileSync(DEFAULT_DATA_PATH + jsonname, 'utf8'));
    } catch (e) {
        console.log(e.message);
    }
    return array; //参照渡しできない連想配列用
};



// トークンの用意
const discord_token = setting_array[`discord_token`];

client.on('ready', () => {
    console.log('甘奈ちゃんが待機し始めました');
    client.user.setActivity('甜花ちゃんの寝顔', { type: 'WATCHING' });

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

client.login('token');