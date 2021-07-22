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
const Discord = require('discord.js@dev'); // discord.js モジュールのインポート
const Burn_min = require("./burn/min.js")
let Burn_minimum = new Burn_min().min;

// Discord Clientのインスタンス作成
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

//fs-extra
const fs = require('fs-extra');


//setting.json読込(連想配列)
let setting_array = {};
setting_array = Burn_minimum.json_defalt_read(`discord.json`, setting_array); //参照渡しできないため

// トークンの用意
const discord_token = setting_array[`discord_token`];
//これ流出したらまずいですよ！の部分はsetting.jsonへ



client.on('ready', () => { // 準備完了イベントのconsole.logで通知黒い画面に出る。
    console.log('burning_bot start');
    client.user.setActivity('🔥', { type: 'WATCHING' });
});



client.on("voiceStateUpdate", (oldState, newState) => { //voicestateupdate
    if (newState && oldState) {
        //Amana_minimumで作る
        //実処理ここから
        if (oldState.channelID === newState.channelID) {
            //ここはミュートなどの動作を行ったときに発火する場所

        }
        if (oldState.channelID === null && newState.channelID != null) {
            //ここはconnectしたときに発火する場所
            console.log(`connect`);

        }
        if (oldState.channelID != null && newState.channelID === null) {
            //ここはdisconnectしたときに発火する場所
            console.log(`disconnect`);

        }

    }

});




client.login(discord_token); // Discordへの接続