////////////////////////////////////////////////////////////////////////
//
//  ///////
//  //   //            
//  /////////  //  //  //////  ///////  //  ///////  ///////
//  //     //  //  //  //      //   //  //  //   //  //   //
//  /////////  //////  //      //   //  //  //   //  ///////
//                                                        //
//                                                   ///////
//
/////////////////////////////////////////////////////////////////////////

/*
■　注意
Discord.js@devになっていますが、v13リリースのあとは置き換えること。
*/


//おまじない
const { Intents, Client } = require('discord.js'); // discord.js モジュールのインポート

//外部に出した関数
const Burn_min = require("./burn/min.js");
let Burn_minimum = new Burn_min.Burn_minimum();
const Burn_role = require("./burn/role.js");



// Discord Clientのインスタンス作成
const options = {
    intents: Intents.FLAGS.GUILDS |
        Intents.FLAGS.GUILD_MEMBERS |
        Intents.FLAGS.GUILD_BANS |
        Intents.FLAGS.GUILD_EMOJIS |
        Intents.FLAGS.GUILD_INTEGRATIONS |
        Intents.FLAGS.GUILD_WEBHOOKS |
        Intents.FLAGS.GUILD_INVITES |
        Intents.FLAGS.GUILD_VOICE_STATES |
        Intents.FLAGS.GUILD_PRESENCES |
        Intents.FLAGS.GUILD_MESSAGES |
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS |
        Intents.FLAGS.GUILD_MESSAGE_TYPING |
        Intents.FLAGS.DIRECT_MESSAGES |
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS |
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
};
const client = new Client(options);




//setting.json読込(連想配列)
let setting_array = {};
setting_array = Burn_minimum.json_read_default(`discord.json`, setting_array); //参照渡しできないため

// トークンの用意
const discord_token = setting_array[`discord_token`];
//これ流出したらまずいですよ！の部分はsetting.jsonへ



client.on('ready', () => { // 準備完了イベントのconsole.logで通知黒い画面に出る。
    console.log('burning_bot start');
    client.user.setActivity('🔥', { type: 'WATCHING' });
});



client.on("voiceStateUpdate", (oldState, newState) => { //voicestateupdate
    Burn_min.Burn_DirExistCheck(oldState.guild);

    Burn_role.VC_Role_Interlocking(oldState, newState, "VC_in");
});




client.login(discord_token); // Discordへの接続