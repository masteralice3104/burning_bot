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
const Amana_tenko = require('./amana_func').Amana_tenko;
const Amana_func = require('./amana_func');

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
                .addChoice('delete', 'delete')),


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

    const channelid = interaction.channel.id;

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

        }
        if (interaction.options.getString("コマンド") === 'delete') {
            await interaction.reply(`点呼データをリセットしたよ！`);
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

            //ここからクラス
            class Amana extends Amana_minimum {

                //コンストラクタ
                constructor() {
                    //親クラスのコンストラクタを呼び出す
                    super();

                    //名前配列関係
                    this.name_array = []; //名前配列(id)
                    this.name_list_array = []; //名前表示名配列
                    //this.name_touroku = {}; //名前置換テーブル(連想配列)

                    //組関係
                    this.kumi_name = {}; //ジャンル:組名配列　(連想配列)
                    this.kumi_array = []; //組分け用1組あたりの人数配列

                    //afk関係
                    this.afk_name_array = []; //afk配列

                    //メモ関係
                    this.memo_array = [];

                    //サーバー外部コマンド
                    this.OtherCommand = [];
                    this.OtherCommand_data = [];

                    //デバッグ判定
                    this.debug = 0;

                    //他のサーバーに書き込むこっそり機能
                    this.otherServer = 0;
                }


                //各種テキストファイル表示
                text_send(text_name) {
                    //ヘルプ
                    let reply_text = '';
                    let filepath = NOW_ID_PATH + "/" + text_name;
                    const fsa = require('fs');

                    if (!fsa.existsSync(filepath)) {
                        filepath = `./` + text_name;
                    }


                    let text = fsa.readFileSync(filepath, 'utf8');
                    let lines = text.toString().split('¥n');
                    for (let line of lines) {
                        reply_text += line;
                    }
                    this.message_send(reply_text); //メッセージ送信
                }

                //チャンネルに送る
                message_send(send_text) {
                    Amana_func.Channel_send(client, channelid, send_text);
                    /*
                    message.channel.send(send_text)
                        .then(message => console.log(`甘奈「${message}」`))
                        .catch(console.error);
                        */
                };
                //既読をつける
                message_react() {
                    message.react('⭐')
                        .then(message => console.log(`甘奈確認！`))
                        .catch(console.error);
                }
                DM_send(send_text, to_id) {
                    message.guild.members.resolve(to_id).user.send(send_text)
                        .then(message => console.log(`DM甘奈「${this.omittedContent(to_id)}:${message}」`))
                        .catch(console.error);
                }

                //計数
                tenko_reset() { //ネーム配列リセット
                    this.name_array = [];
                    console.log(`ネーム配列　を空にしました`);

                    this.ServerNameArraySave();
                }
                tenko_count(userid) { //ネーム配列に追加
                    this.name_array.push(userid);
                    this.ServerNameArraySave();
                }
                tenko_double_delete(userid) {
                    this.name_array = this.Array_Removal(this.name_array, userid);
                    this.ServerNameArraySave();
                }

                //組名処理関係
                kumi_name_mode_change(new_name) {
                    this.setting["kumi_name_mode"] = new_name;
                    this.ServerSettingSave();
                }
                kumi_name_call() {
                    return this.kumi_name[this.setting["kumi_name_mode"]][1]; //配列を返す
                }
                kumi_name_mode_name_call() {
                    return this.kumi_name[this.setting["kumi_name_mode"]][0];
                }

                //組分けモード切替
                kumi_mode_change(mode) {
                    this.setting["kumi_mode"] = mode;
                    this.ServerSettingSave();
                }
                kumi_mode_call() {
                    return this.setting["kumi_mode"];
                }


                //ツイート用関数
                //簡単だね！
                tweetPost(content) { //Amana_data.tweetPost('test');ってやるだけでツイートできるよ！

                    if (this.setting["consumer_key"]) {
                        //twitter関係
                        //@amana_chang_bot
                        let Twitter = require('twitter');
                        let client = new Twitter({
                            consumer_key: this.setting["consumer_key"],
                            consumer_secret: this.setting["consumer_secret"],
                            access_token_key: this.setting["access_token_key"],
                            access_token_secret: this.setting["access_token_secret"]

                            //この辺漏れるとまずいですよ！
                        });

                        client.post('statuses/update', { status: content }, function(error, tweet, response) {
                            if (!error) {
                                console.log("甘奈のﾂｲｰﾄ: " + content);
                            } else {
                                console.log(error);
                            }
                        });

                    }
                    return;

                }



                //配列ランダム化処理(バグ注意)
                static shuffleArray(arr) {
                    for (let i = arr.length - 1; i >= 0; i--) {
                        let j = this.Random(arr.length - 1); //random index
                        if (j < 0) { j = 0; }
                        if (j >= arr.length) { j = arr.length - 1; }
                        [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
                    }
                };

                //ランダム関数(バグ注意)
                static secureRandom() {
                    let MersenneTwister = require('mersennetwister');
                    const { performance } = require('perf_hooks');
                    let seed = performance.now();
                    let mt = new MersenneTwister(seed);
                    let random = mt.rnd();
                    return random;
                }
                static Random(jougen) {

                    // [0.0, 1.0]区間でセキュアな乱数を生成する

                    let rand = 0;
                    for (let i = 0; i < this.secureRandom() * 5; i++) {
                        rand = Math.round(this.secureRandom() * jougen);
                    }
                    if (rand >= jougen | rand < 0) {
                        return this.Random(jougen);
                    }
                    return rand;
                }; //0～正の上限値-1の間のランダムな整数を返す

                //配列から指定のものを削除
                Array_Removal(Array, Removal) {
                    //配列から削除
                    Array = Array.filter(function(v) {
                        return !Removal.includes(v);
                    });
                    return Array;
                }


                //ユーザID→文字列短縮・置換関数
                omittedContent(userid) {
                    let name_string = ``;
                    // 定数で宣言
                    const MAX_LENGTH = 10;
                    console.log(userid);

                    if (isNaN(userid)) {
                        return `ERROR:undefined`;
                    }

                    //値のコピー
                    let user_name = '';
                    try {
                        user_name = message.guild.members.resolve(`${userid}`).user.username;
                    } catch (e) {
                        return `エラー！`;
                    }


                    name_string = user_name;
                    if (this.name_touroku[name_string]) {
                        //存在する時の処理
                        name_string = this.name_touroku[name_string];
                    }
                    //文字列置き換えテーブル確認

                    // もしstringの文字数がMAX_LENGTH（今回は10）より大きかったら末尾に...を付け足して返す。
                    if (name_string.length > MAX_LENGTH) {
                        // substr(何文字目からスタートするか, 最大値);
                        name_string = name_string.substr(0, MAX_LENGTH) + '...';
                    }

                    return name_string;


                };
                //時間を取得し指定形式で返してくれる関数
                static TimeFormat(format) {
                    const date = new Date();
                    return date.toFormat(format);
                }


                //OtherCommand
                //コマンド存在確認
                OtherCommand_Exist(instr) {
                    let Exist_Array = [];
                    for (let i = 0; i < this.OtherCommand.length; i++) {
                        if (JSON.stringify(this.OtherCommand[i]["instr"]) == JSON.stringify(instr)) {
                            Exist_Array.push(i);
                        }
                    }
                    console.log(`コマンド発見：${Exist_Array}`);
                    return Exist_Array;
                }

                //コマンド動かす！
                OtherCommand_Run(number) {
                    if ("timestart" in this.OtherCommand[number]) {
                        if (this.OtherCommand_Time_Select(number) == false) {
                            return;
                        }
                    }
                    if (this.OtherCommand[number]["type"] == `report_list`) {
                        console.log(`${number}:report_list`);
                        let report_list = this.OtherCommand_Report(this.OtherCommand[number]["cond"])
                        let send_a = report_list.join("　");
                        this.OtherCommand_Type_message_send(number);
                        this.message_send(send_a);

                    }
                    if (this.OtherCommand[number]["type"].indexOf("message_random") != 0) {

                        if (this.OtherCommand[number]["message_random"].length > 0) {
                            console.log(`${number}:message_random`);

                            if ("tweet" in this.OtherCommand[number]) {
                                this.OtherCommand_Type_message_random(number, this.OtherCommand[number]["tweet"]);
                            } else {
                                this.OtherCommand_Type_message_random(number);
                            }
                        }
                    }
                    if (this.OtherCommand[number]["type"] == `message_send`) {
                        console.log(`${number}:message_send`);
                        this.OtherCommand_Type_message_send(number);
                    }
                    if (this.OtherCommand[number]["add"].length > 0) {
                        console.log(`${number}:add`);
                        this.OtherCommand_Add(this.OtherCommand[number]["add"]);
                    }
                }
                OtherCommand_Type_message_send(number) {
                    for (let i = 0; i < this.OtherCommand[number][`message_send`].length; i++) {
                        let temp_com = this.OtherCommand_Replace(this.OtherCommand[number][`message_send`][i]);
                        this.message_send(temp_com);
                    }
                }
                OtherCommand_Type_message_random(number, tweet = false) {
                    let select = Amana.Random(this.OtherCommand[number][`message_random`].length);
                    console.log(this.OtherCommand[number][`message_random`].length)
                    let temp_com = this.OtherCommand_Replace(this.OtherCommand[number][`message_random`][select]);
                    this.message_send(temp_com);

                    if (tweet == true) {
                        this.tweetPost(temp_com);
                    }

                }
                OtherCommand_Time_Select(number) {
                    if (this.OtherCommand[number]["type"].indexOf('timeselect') != -1) {

                        const date = new Date();
                        const nowHH24 = Number(date.getHours());
                        const nowMinutes = Number(date.getMinutes());
                        const nowTime = nowHH24 * 100 + nowMinutes;


                        if (this.OtherCommand[number]["timestart"] <= nowTime &&
                            this.OtherCommand[number]["timeend"] >= nowTime) {
                            return true;
                        }

                    }
                    return false;
                }
                OtherCommand_Report(cond) {
                    //addされているものの形式はこう
                    //["{tomorrow_UTCms}", "/onid", "intai", "", "{onid}"]
                    //　有効期限            指定コマンド　ここまで　記録本体
                    //condは入力した条件

                    let comd_temp = this.OtherCommand_ReplaceArray(cond);
                    let temp_array = []; //条件を満たした記録本体を突っ込むもの
                    for (let i = 0; i < this.OtherCommand_data.length; i++) {
                        let data = this.OtherCommand_data[i];

                        if (comd_temp[0] < data[0]) {
                            if (comd_temp[1] == data[1] &&
                                comd_temp[2] == data[2] &&
                                comd_temp[3] == data[3]) {
                                console.log(`3番まで一致:${data[4]}`)
                                if (comd_temp[4] == "*") {
                                    //なんでもいいやつ
                                    temp_array.push(data[4]);
                                }
                            }
                        }

                    }
                    console.log(`temp_array:${temp_array}`);

                    return temp_array;
                }
                OtherCommand_ReplaceArray(str_array) {
                    let ret_array = [];
                    for (let i = 0; i < str_array.length; i++) {
                        ret_array.push(this.OtherCommand_Replace(str_array[i]))
                    }
                    return ret_array;
                }
                OtherCommand_Replace(str) {
                    const replace_array = [
                        ["{onid}", this.omittedContent(message.author.id)],
                        ["{author_id}", message.author.id],
                        ["{now_hour}", Amana.TimeFormat("HH24")],
                        ["{now_min}", Amana.TimeFormat("MI")],
                        ["{now_UTCms}", Date.now()],
                        ["{yesterday_UTCms}", Date.now() - 86400 * 1000],
                        ["{tomorrow_UTCms}", Date.now() + 86400 * 1000]
                    ];
                    if (str.length) {
                        let return_str = str.concat();
                        for (let i = 0; i < replace_array.length; i++) {
                            return_str = return_str.replace(replace_array[i][0], replace_array[i][1])
                        }
                        return return_str;

                    }
                    return str;
                }
                OtherCommand_Add(add_array) {
                    let temp_array = [];
                    for (let i = 0; i < add_array.length; i++) {
                        temp_array.push(this.OtherCommand_Replace(add_array[i]));
                    }

                    console.log(temp_array);
                    this.OtherCommand_data.push(temp_array);
                    this.OtherCommand_DataSave();
                }

                //他鯖データをいじるときのパスワード
                PassCreate() {
                    let pass = ``;
                    while (pass.length < 10) {
                        pass = Math.random().toString(32).substring(2);
                        console.log(`パスワード生成 : ${pass}`);
                    }
                    return pass;
                }
                OtherPassCreate() {
                    this.setting["pass"] = this.PassCreate();
                    console.log(`出力パスワードは:${this.setting.pass}`)
                }
                OtherPassCheck() {
                    if (this.setting["pass"]) {
                        return this.setting["pass"];
                    }
                    return 0;
                }


                OtherPassMatch(serverid, pass) {
                    let temp_setting = {};
                    temp_setting = this.json_read(`setting.json`, temp_setting, serverid);
                    if (temp_setting["pass"] === pass) {
                        console.log(`パスワード一致 : ${serverid}`);
                        return true;
                    }
                    return false;
                }


                //VC出入り通知bot
                VC_InOutSaySetting(set) { //設定
                    this.setting["vc_inout"] = set;
                    this.ServerSettingSave();
                }
                VC_InOutSayChannelIdSetting(id) {
                    this.setting["vc_inout_noticechid"] = id;
                    this.ServerSettingSave();
                }




                //初期化用
                ServerInit() {

                    this.ServerIdGet();
                    this.ServerSettingLoad();
                    this.ServerNameLoad();
                    this.ServerAFKLoad();
                    this.ServerNameArrayLoad();
                    this.ServerKumiNameArrayLoad();
                    this.ServerMemoArrayLoad();
                    this.ServerOtherCommandLoad();
                    this.OtherCommand_DataLoad();
                }

                //サーバー設定関係
                ServerIdGet() { //サーバーid取得
                    if (this.otherServer == 0) {
                        try {
                            this.id = message.guild.id;
                        } catch (e) {
                            this.id = message.channel.id;
                        }
                    }
                };
                ServerSettingSave() { //サーバー設定書き込み
                    this.json_write(`setting.json`, this.setting);
                }
                ServerNameSave() { //サーバーに名前置換テーブル書き込み
                    this.json_write(`namedata.json`, this.name_touroku);
                };
                ServerAFKLoad() { //afk配列読込
                    this.afk_name_array = this.json_read(`afkdata.json`, this.afk_name_array);
                };
                ServerAFKSave() { //afk配列書き込み
                    this.json_write(`afkdata.json`, this.afk_name_array);
                };
                ServerNameArrayLoad() { //ネーム配列読込
                    this.name_array = this.json_read(`namearray.json`, this.name_array);
                }
                ServerNameArraySave() { //ネーム配列書き込み
                    this.json_write(`namearray.json`, this.name_array);
                }
                ServerKumiNameArrayLoad() { //組名一覧読込
                    this.kumi_name = this.json_read(`kumi_name.json`, this.kumi_name);
                }
                ServerKumiNameArraySave() { //組名一覧書き込み
                    this.json_write(`kumi_name.json`, this.kumi_name);
                }
                ServerMemoArrayLoad() { //メモ一覧読込
                    this.memo_array = this.json_read(`memodata.json`, this.memo_array);
                }
                ServerMemoArraySave() { //メモ一覧書き込み
                    this.json_write(`memodata.json`, this.memo_array);
                }
                ServerOtherCommandLoad() { //initで処理
                    let array1 = [];
                    let array2 = [];
                    array1 = this.json_read(`othercommand.json`, array1);
                    array2 = this.json_read(`othercommand.json`, array2, "common");
                    this.OtherCommand = array1.concat(array2);
                };
                OtherCommand_DataSave() {
                    this.json_write(`othercommand_data.json`, this.OtherCommand_data);
                }
                OtherCommand_DataLoad() {
                    this.OtherCommand_data = this.json_read(`othercommand_data.json`, this.OtherCommand_data);
                }
            }



            //甘奈クラス
            let Amana_data = new Amana;
            //初期化
            Amana_data.ServerInit();




            //点呼ちゃん
            Amana_tenko(message, Amana_data, Amana);

            //計数
            for (let i = 0; i < Amana_data.setting["tenko_count"].length; i++) {
                if (message.content === Amana_data.setting["tenko_count"][i]) {
                    //一致時
                    const author = message.author.username;
                    const mes_id = message.author.id;
                    Amana_data.message_react();

                    Amana_data.tenko_count(mes_id);
                    console.log(`ネーム配列　に　${mes_id} : ${author}を追加しました`);

                    return;
                }
            }

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
            let instr_full = message.content;

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



            if ((instr[0] === `組分けだね！わかった！`) && message.author.bot == true) {
                Amana_func.Amana_hat(client, channelid, Amana_data, Amana);
            }
            if ((instr[0] === `点呼データをリセットしたよ！`) && message.author.bot == true) {
                //配列を空にする
                Amana_data.tenko_reset();

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
                //  点呼表示　　                                             //
                //                                                          //
                //////////////////////////////////////////////////////////////
                if (instr[1] === `list` && instr.length > 1) {
                    let reply_text = `参加者一覧の表示をするよ！\n`;
                    Amana_data.message_send(reply_text);
                    if (Amana_data.name_array.length == 0) {
                        reply_text = `……いないよ！\n`;
                    } else {
                        reply_text = `${Amana_data.name_array.length}人いるよ！\n`;
                    }
                    for (let i = 0; i < Amana_data.name_array.length; i++) {
                        reply_text += `${Amana_data.omittedContent(Amana_data.name_array[i])}　`;
                    }
                    Amana_data.message_send(reply_text);

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