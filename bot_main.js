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



function json_defalt_read(jsonname, array) {
    try {
        array = JSON.parse(fse.readFileSync(DEFAULT_DATA_PATH + jsonname, 'utf8'));
    } catch (e) {
        console.log(e.message);
    }
    return array; //参照渡しできない連想配列用
};

//require
const Amana_minimum = require('./amana_func').Amana_minimum;
const Amana_func = require('./amana_func');
const Amana = require('./amana_class').Amana;
const amana_func = require('./amana_func');


//setting.json読込(連想配列)
let setting_array = {};
setting_array = json_defalt_read(`discord.json`, setting_array); //参照渡しできないため



// トークンの用意
const discord_token = setting_array[`discord_token`];
const discord_clientid = setting_array[`discord_clientid`];
const test_guildid = setting_array[`test_guildid`];

client.on('ready', () => {

    //スラッシュコマンドデバッグ用

    const commands = [
            new SlashCommandBuilder()
            .setName(`amana`)
            .setDescription('甘奈がお手伝いするね！')
            .addStringOption(option =>
                option.setName('コマンド')
                .setDescription('何をすればいいかな？')
                .setRequired(true)
                .addChoice('tenko', 'tenko')
                .addChoice('hat', 'hat')
                .addChoice('delete', 'delete')
                .addChoice('list', 'list')
            ),


            new SlashCommandBuilder()
            .setName(`hayate_perfect`)
            .setDescription('久川颯「パーフェクト！」')
        ]
        .map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(discord_token);

    rest.put(Routes.applicationGuildCommands(discord_clientid, test_guildid), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error); //指定したサーバーにコマンドを登録・更新
    //ここまでスラッシュコマンドデバッグ用


    console.log('甘奈ちゃんが待機し始めました');
    client.user.setActivity('甜花ちゃんの寝顔', { type: 'WATCHING' });


});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    //必要な関数
    //guildのid取得
    let guildid, chid
    try {
        guildid = interaction.guild.id;
        chid = interaction.channel.id;
    } catch (e) {
        guildid = interaction.channel.id; //DMとかのやつのために
        chid = interaction.channel.id; //DMとかのやつのために
    }

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
        console.log(interaction);
        if (interaction.options.getString("コマンド") === 'tenko') {
            await interaction.reply('<:amana_tenko:843524326112100362>');

        }
        if (interaction.options.getString("コマンド") === 'hat') {
            await interaction.reply('組分けだね！わかった！');
            Amana_func.Amana_hat(client, chid, Amana_data, Amana);

        }
        if (interaction.options.getString("コマンド") === 'delete') {
            await interaction.reply(`点呼データをリセットしたよ！`);
            Amana_data.tenko_reset();
        }
        if (interaction.options.getString("コマンド") === 'list') {
            await interaction.reply(Amana_func.Amana_list(Amana_data));
        }

    }
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

            //共通変数
            let channelid = message.channel.id;


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

            //ダブリ削除
            for (let i = 0; i < Amana_data.setting["tenko_delete"].length; i++) {
                if (message.content === Amana_data.setting["tenko_delete"][i]) {
                    //一致時
                    //実際の処理
                    const author = message.author.username;
                    const mes_id = message.author.id;

                    Amana_data.message_send(`組分けから ${author} を削除したよ☆`);

                    Amana_data.tenko_double_delete(mes_id);
                    Amana_data.tenko_count(mes_id);
                    console.log(`ネーム配列から${author}のダブリを排除しました`);
                    return;
                }
            }



            //配列に分割
            let instr = message.content.split(/\s/);

            //////////////////////////////////////////////////////////////
            //                                                          //
            //  デバッグコマンド　                                        //
            //                                                          //
            //////////////////////////////////////////////////////////////
            if (instr[0] === `debug`) {
                Amana_data.debug = 1;
                instr.shift(); //一個ずつずらす
            }



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
                    console.log(Exist_Array[i]);
                }
            }
            if (instr[0] === `/amana` && instr[1] === `command` && instr[2] === `reload`) {
                Amana_data.ServerOtherCommandLoad();
                Amana_data.message_send(`コマンドの再読み込みをしたよ！`);
            }




            if (instr[0] === `/amana`) {

                //共通変数
                let author = message.author.username;







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

                //////////////////////////////////////////////////////////////
                //                                                          //
                //  組分けモード切替　　　　　                                 //
                //                                                          //
                //////////////////////////////////////////////////////////////
                if (instr[1] === `mode` && !isNaN(instr[2])) {

                    Amana_data.kumi_mode_change(Number(instr[2]));

                    let sum = Amana_data.kumi_mode_call() + 3;
                    if (sum == 3 | sum == 4) {
                        Amana_data.message_send(`組分けのとき${sum}人を優先するよ！`);
                        console.log(`kumi_mode：${Amana_data.kumi_mode_call()}`);
                    } else {
                        Amana_data.message_send(`入力が変だよ！`);
                    }
                }



                //////////////////////////////////////////////////////////////
                //                                                          //
                //  名前置換テーブル操作関係                                  //
                //                                                          //
                //////////////////////////////////////////////////////////////
                if (instr[1] === `name` && instr.length > 1) {
                    //名前関係
                    if (instr[2] === `add` && instr.length > 3) {
                        //名前置換ルール追加
                        Amana_data.name_touroku[`${author}`] = instr[3]; //配列への追加
                        let reply_text = `置換ルール：${author} → ${instr[3]} を登録したよ！`;
                        Amana_data.message_send(reply_text); //メッセージ送信
                        //処理
                        Amana_data.ServerNameSave();
                        return;
                    }
                    if (instr[2] === `delete` && instr.length == 3) {
                        //名前置換ルール削除
                        let reply_text = `置換ルール：${author} → ${ Amana_data.name_touroku[`${author}`]} を削除したよ！`;
                    Amana_data.message_send(reply_text);//メッセージ送信
                    delete  Amana_data.name_touroku[`${author}`];//配列からの削除
                    Amana_data.ServerNameSave();
                    return;
            }
            
        }

        //////////////////////////////////////////////////////////////
        //                                                          //
        //  ヘルプ関係                                               //
        //                                                          //
        //////////////////////////////////////////////////////////////
        if (instr[1]===`help`&& instr.length==2){
            //Amana_data.text_send("help.txt");
            return;
        }

        //////////////////////////////////////////////////////////////
        //                                                          //
        //  実装予定機能リスト関係                                     //
        //                                                          //
        //////////////////////////////////////////////////////////////
        if (instr[1]===`jissou`&& instr.length==2){
            Amana_data.text_send("./jissou_yotei.txt");
            return;
        }
        
        //////////////////////////////////////////////////////////////
        //                                                          //
        //  バージョン確認関係                                        //
        //                                                          //
        //////////////////////////////////////////////////////////////
        if (instr[1]===`version`&& instr.length==2){        
            let reply_text='';
            let stats = fse.statSync("./bot_main.js");
            let mtime = stats.mtime;
            reply_text = '更新日：' + mtime;
            Amana_data.message_send(reply_text);//メッセージ送信
            return;
        }

 

        

    }
            
       



    //試験用
    if (message.content === '/test test test') {

        let reply_text = ``;


        message.channel.send(reply_text)
            .then(message => console.log(`テスト完了`))
            .catch(console.error);
    }


});


client.login(discord_token);