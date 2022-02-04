///neroなど無駄にメンテ性の良いクソコマンドたち
//点呼組分け
//名前置き換え機能
//
//
//  
//
//
//



const { Client, Intents } = require('discord.js'); //discordjs v13を読み込む
const { SlashCommandBuilder } = require('@discordjs/builders'); //SlashCommandBuilderを読み込む
const { REST } = require('@discordjs/rest'); //RESTを読み込む
const { Routes } = require('discord-api-types/v9'); //Routesを読み込む
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
//fs-extra
const fse = require('fs-extra');
const DEFAULT_DATA_PATH = __dirname + `/../burning_bot_data/`;
require('date-utils');





//require
const Amana_minimum = require('./amana_func').Amana_minimum;
const Amana_func = require('./amana_func');
const Amana = require('./amana_class').Amana;
const amana_func = require('./amana_func');


//setting.json読込(連想配列)
let setting_array = {};
setting_array = Amana_func.json_default_read(`discord.json`, setting_array); //参照渡しできないため



// トークンの用意
const discord_token = setting_array[`discord_token`];
client.on('ready', () => {

    console.log('甘奈ちゃんが待機し始めました');
    client.user.setActivity('甜花ちゃんの寝顔', { type: 'WATCHING' });


});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    //必要な関数
    //guildのid取得
    let guildid, chid, author_name
    try {
        guildid = interaction.guild.id;
        chid = interaction.channel.id;
    } catch (e) {
        guildid = interaction.channel.id; //DMとかのやつのために
        chid = interaction.channel.id; //DMとかのやつのために
    }
    author_name = interaction.user.username;
    //console.log('interaction');
    console.log(interaction.user.username);

    //設定ファイル関係がなかったら困るので
    const DEFAULT_PATH = DEFAULT_DATA_PATH + `default` + `/`;
    let NOW_ID_PATH = ``;
    try {
        NOW_ID_PATH = DEFAULT_DATA_PATH + guildid + `/`;
        console.log("ギルドIDモード")
    } catch (e) {
        NOW_ID_PATH = DEFAULT_DATA_PATH + chid + `/`;
        console.log("チャンネルIDモード")
    }
    if (fse.existsSync(NOW_ID_PATH)) {
        //存在するのでそのまま
        console.log(`ディレクトリ：${NOW_ID_PATH}を検出！`)
    } else {
        console.log(`ディレクトリ：${NOW_ID_PATH}は存在しません`);

        fse.copySync(DEFAULT_PATH, NOW_ID_PATH);
        console.log(`ディレクトリ：${NOW_ID_PATH}が作成されました`);
    }

    //甘奈クラス
    let Amana_data = new Amana;

    //初期化
    Amana_data.ServerInit(client, guildid, chid);




    const { commandName } = interaction;

    if (commandName === 'hayate_perfect') {
        await interaction.reply('<:hayate_perfect:914900327134822420>');
    }
    if (commandName === 'amana') {
        if (interaction.options.getSubCommand() === 'tenko') {
            await interaction.reply('<:amana_tenko:843524326112100362>');
        }

        if (interaction.options.getSubCommand() === 'hat') {
            await interaction.reply('組分けだね！わかった！');
            Amana_func.Amana_hat(client, chid, Amana_data, Amana);
        }
        if (interaction.options.getSubCommand() === 'delete') {
            await interaction.reply(`点呼データをリセットしたよ！`);
            Amana_data.tenko_reset();
        }
        if (interaction.options.getSubCommand() === 'list') {
            await interaction.reply(Amana_func.Amana_list(Amana_data));
        }
        if (interaction.options.getSubCommand() === 'version') {
            await interaction.reply(Amana_func.Amana_version());
        }
        if (interaction.options.getSubCommand() === 'mode') {
            const option1 = interaction.options.getString('option1');
            await interaction.reply(Amana_func.kumi_mode_change(Amana_data, option1));
        }
        if (interaction.options.getSubCommand() === 'nameadd') {
            const option1 = interaction.options.getString('name');
            await interaction.reply(Amana_func.name_table_change(Amana_data, "add", option1, author_name));
        }
        if (interaction.options.getSubCommand() === 'namedel') {
            await interaction.reply(Amana_func.name_table_change(Amana_data, "delete", "nothing", author_name));
        }
        if (interaction.options.getSubCommand() === 'commandload') {
            Amana_data.ServerCommandLoad();
            await interaction.reply("コマンド再読み込みを行ったよ！");
        }

    }

    const instr = { commandName };



});

// メッセージがあったら何かをする
client.on('messageCreate', message => {

    //必要な関数

    //設定ファイル関係がなかったら困るので
    const DEFAULT_PATH = DEFAULT_DATA_PATH + `default` + `/`;

    let NOW_ID_PATH = ``;
    try {
        NOW_ID_PATH = DEFAULT_DATA_PATH + message.guild.id + `/`;
        console.log("ギルドIDモード")
    } catch (e) {
        NOW_ID_PATH = DEFAULT_DATA_PATH + message.channel.id + `/`;
        console.log("チャンネルIDモード")
    }
    if (fse.existsSync(NOW_ID_PATH)) {
        //存在するのでそのまま
        console.log(`ディレクトリ：${NOW_ID_PATH}を検出！`)
    } else {
        console.log(`ディレクトリ：${NOW_ID_PATH}は存在しません`);

        fse.copySync(DEFAULT_PATH, NOW_ID_PATH);
        console.log(`ディレクトリ：${NOW_ID_PATH}が作成されました`);
    }

    //甘奈クラス
    let Amana_data = new Amana;

    //guildのid取得
    let guildid, chid
    try {
        guildid = message.guild.id;
        chid = message.channel.id;
    } catch (e) {
        guildid = message.channel.id; //DMとかのやつのために
        chid = message.channel.id; //DMとかのやつのために
    }

    //初期化
    Amana_data.ServerInit(client, guildid, chid);




    //点呼ちゃん
    Amana_func.Amana_tenko(message, Amana_data, Amana);

    //計数
    Amana_func.Amana_count(message, Amana_data);

    //組分けから排除
    for (let i = 0; i < Amana_data.setting["tenko_delete"].length; i++) {
        if (message.content === Amana_data.setting["tenko_delete"][i]) {
            //一致時
            //実際の処理
            const author = message.author.username;
            const mes_id = message.author.id;

            Amana_data.message_send(`組分けから ${author} を削除したよ☆`);

            Amana_data.tenko_double_delete(mes_id);
            console.log(`ネーム配列から${author}のダブリを排除しました`);
            return;
        }
    }



    //配列に分割
    let instr = message.content.split(/\s/);



    //////////////////////////////////////////////////////////////
    //                                                          //
    //  雀魂のURLを自動で送りつける                               //
    //                                                          //
    //////////////////////////////////////////////////////////////
    if (isNaN(instr[0]) == false && Number(instr[0]) >= 10000 && Number(instr[0]) <= 99999) {

        //: https://game.mahjongsoul.com/?room=
        let url = `https://game.mahjongsoul.com/?room=` + instr[0];
        Amana_data.message_send(url)
    }

    //////////////////////////////////////////////////////////////
    //                                                          //
    //  他鯖に書き込むコマンド類                                  //
    //                                                          //
    //////////////////////////////////////////////////////////////
    if (instr[0] === `/amana`) {
        if (instr[1] == `/other`) {
            const input_serverid = instr[2];
            const input_serverpass = instr[3];
            const input_serveridpath = DEFAULT_DATA_PATH + input_serverid + `/`;
            if (fse.existsSync(input_serveridpath)) {
                //存在するのでそのまま
                console.log(`ディレクトリ：${input_serveridpath}を検出！`);

                //パスワード照合
                if (Amana_data.OtherPassMatch(input_serverid, input_serverpass)) {
                    //あってた
                    Amana_data.message_send(`甜花「なーちゃんよろしく！」`);
                    Amana_data.id = input_serverid;
                    Amana_data.otherServer = 1;
                    instr.shift();
                    instr.shift();
                    instr.shift();
                    instr.shift();

                    Amana_data.ServerInit();
                } else {
                    //間違ってた
                    Amana_data.message_send(`プロデューサーさん！`);
                    Amana_data.message_send(`なにかがちがうよ！`);
                    return;
                }

            } else {
                //存在しない時
                console.log(`ディレクトリ：${input_serveridpath}は存在しません`);
                Amana_data.message_send(`プロデューサーさん！`);
                Amana_data.message_send(`知らないIDだよ！`);
                return;
            }

        }
        if (instr[1] === `server` && instr[2] === `pass`) {
            if (!Amana_data.OtherPassCheck() || instr[3] === `new`) {
                Amana_data.message_send(`パスワードを新規作成するよ！`);
                Amana_data.OtherPassCreate(); //パスワード作成
                Amana_data.ServerSettingSave();
            }
            let reply_text = ``;
            reply_text += `■サーバー情報\n`;
            reply_text += `サーバーID：${Amana_data.id}\n`;
            if (Amana_data.OtherPassCheck() == 0) {
                reply_text += `パスワードが不正です`;
            } else {
                reply_text += `サーバーPASS：${Amana_data.OtherPassCheck()}\n`;

            }
            reply_text += `/amana server pass new でパスワードを作り直せるよ！`;
            Amana_data.message_send(reply_text);

        }
    }






    //////////////////////////////////////////////////////////////
    //                                                          //
    //  OtherCommand                                           //
    //                                                          //
    //////////////////////////////////////////////////////////////
    /*
    ■　コマンド一覧
    /amana tenka
    /akari nashiteya
    */
    if (Amana_data.OtherCommand_Exist(instr).length != 0) {
        let Exist_Array = [];

        Exist_Array = Amana_data.OtherCommand_Exist(instr);
        for (let i = 0; i < Exist_Array.length; i++) {
            Amana_data.OtherCommand_Run(Exist_Array[i]);

            if (Amana_data.message_stack != "") {
                Amana_data.message_send(Amana_data.message_stack);
                Amana_data.message_stack = "";
            }
            console.log(Exist_Array[i]);
        }
    }
    if (instr[0] === `/amana` && instr[1] === `command` && instr[2] === `reload`) {
        Amana_data.ServerOtherCommandLoad();
        Amana_data.message_send(`コマンドの再読み込みをしたよ！`);
    }




    if (instr[0] === `/amana`) {

        //////////////////////////////////////////////////////////////
        //                                                          //
        //  組名切替　　                                             //
        //                                                          //
        //////////////////////////////////////////////////////////////
        if (instr[1] === `mode` && instr[2] != `add` && instr[2] != `delete` && isNaN(instr[2])) {
            let reply_text = ``;
            if (Amana_data.kumi_name[instr[2]]) {
                //組名存在時
                Amana_data.kumi_name_mode_change(instr[2]);
                reply_text = `グループ名を${Amana_data.kumi_name_mode_name_call()}モードにするよ！`
            } else {
                //存在しない時
                reply_text = `グループ名キー:${instr[2]}は見つからなかったよ！`
            }
            Amana_data.message_send(reply_text);
            console.log(`組名：${Amana_data.kumi_name_mode_name_call()}`);
            return;
        }







    }






});


client.login(discord_token);