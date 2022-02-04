const { Client, Intents } = require('discord.js'); //discordjs v13を読み込む
const { SlashCommandBuilder } = require('@discordjs/builders'); //SlashCommandBuilderを読み込む
const { REST } = require('@discordjs/rest'); //RESTを読み込む
const { Routes } = require('discord-api-types/v9'); //Routesを読み込む

const fse = require('fs-extra');
const DEFAULT_DATA_PATH = __dirname + `/../burning_bot_data/`;
require('date-utils');

//require
const Amana_minimum = require('./amana_func').Amana_minimum;
const Amana_func = require('./amana_func');


//setting.json読込(連想配列)
let setting_array = {};
setting_array = Amana_func.json_default_read(`discord.json`, setting_array); //参照渡しできないため

// トークンの用意
const discord_token = setting_array[`discord_token`];
const discord_clientid = setting_array[`discord_clientid`];

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

        //メッセージをここに溜め込む
        this.message_stack = "";

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
        //this.message_send(reply_text); //メッセージ送信しなくなった
        return reply_text;
    }

    //チャンネルに送る
    message_send(send_text) {
        Amana_func.Channel_send(this.client, this.channelid, send_text);
    };

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
        return this.omittedContent_guild(userid, this.client.guilds.cache.get(this.id));
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


    //message_stacksを送る
    message_stack_send() {
        this.message_send(this.message_stack);
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


            //this.message_send(send_a);
            this.message_stack = send_a;
            this.message_stack_send();

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

            //this.message_send(temp_com);
            this.message_stack = temp_com;
            this.message_stack_send();
        }
    }
    OtherCommand_Type_message_random(number, tweet = false) {
        let select = Amana.Random(this.OtherCommand[number][`message_random`].length);
        console.log(this.OtherCommand[number][`message_random`].length)
        let temp_com = this.OtherCommand_Replace(this.OtherCommand[number][`message_random`][select]);
        //this.message_send(temp_com);
        this.message_stack = temp_com;
        this.message_stack_send();


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
    ServerInit(client, guildid, channelid) {
        this.ClientInit(client)
        this.ServerIdGet(guildid, channelid);
        this.ServerSettingLoad();
        this.ServerNameLoad();
        this.ServerAFKLoad();
        this.ServerNameArrayLoad();
        this.ServerKumiNameArrayLoad();
        this.ServerMemoArrayLoad();
        this.ServerOtherCommandLoad();
        this.OtherCommand_DataLoad();

        //this.ServerCommandLoad();//これをあんまり送りすぎるとエラーを吐き始めるよ
    }

    //サーバー設定関係
    ServerIdGet(guildid, channelid) { //サーバーid取得
        if (this.otherServer == 0) {
            this.id = guildid;
            this.channelid = channelid;
        }
    };
    ServerCommandLoad() {

        //スラッシュコマンド用
        const commands = [
                new SlashCommandBuilder()
                .setName(`amana`)
                .setDescription('甘奈がお手伝いするね！')
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('tenko')
                    .setDescription('点呼するよ！')
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('hat')
                    .setDescription('組分けするよ！')
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('delete')
                    .setDescription('組分けデータを削除するよ！')
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('list')
                    .setDescription('点呼済みの人を一覧表示するよ！')
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('mode')
                    .setDescription('組分けのモードを切り替えるよ！')
                    .addStringOption(option =>
                        option.setName('option1')
                        .setDescription('3人組優先か4人組優先かを選んでね！')
                        .setRequired(true)
                        .addChoice('3', '3')
                        .addChoice('4', '4')
                    )
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('nameadd')
                    .setDescription('甘奈にプロデューサーさんの名前を教えて！')

                    .addStringOption(option =>
                        option.setName('name')
                        .setRequired(true)
                        .setDescription('登録する名前を教えてね！')
                    )

                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('namedel')
                    .setDescription('甘奈が覚えている名前の代わりにデフォルト名を使うよ！')
                )

                .addSubcommand(subcommand =>
                    subcommand
                    .setName('version')
                    .setDescription('バージョンを確認するよ！')
                )
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('commandload')
                    .setDescription('コマンド再読み込みをするよ！')

                ),


                new SlashCommandBuilder()
                .setName(`hayate_perfect`)
                .setDescription('久川颯「パーフェクト！」'),

            ]
            .map(command => command.toJSON());

        const rest = new REST({ version: '9' }).setToken(discord_token);

        rest.put(Routes.applicationGuildCommands(discord_clientid, this.id), { body: commands })
            .then(() => console.log('コマンドの登録に成功したよ！'))
            .catch(console.error); //指定したサーバーにコマンドを登録・更新
        //ここまでスラッシュコマンド用


    }
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


module.exports = {
    Amana: Amana

}