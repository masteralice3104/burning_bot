const fse = require('fs-extra');
const DEFAULT_DATA_PATH = __dirname + `/../burning_bot_data/`;
require('date-utils');



class Amana_minimum {
    constructor() {
        //サーバー情報取得
        this.id = 0; //鯖ID
        this.channelid = 0; //出力先チャンネルID

        //サーバー設定
        this.setting = {}; //設定は連想配列

        //名前配列関係
        this.name_touroku = {}; //名前置換テーブル(連想配列)

        //client取得
        this.client;

    }

    //Json読み書き
    json_write(jsonname, array) {
        try {
            fse.writeFileSync(DEFAULT_DATA_PATH + this.id + `/` + jsonname, JSON.stringify(array));
        } catch (e) {
            console.log(e.message);
        }
        return;
    };
    json_read(jsonname, array, folder = this.id) {
        //ファイル存在確認
        if (!fse.existsSync(DEFAULT_DATA_PATH + folder + `/` + jsonname)) {
            //ないとき
            folder = `default`;
        }
        try {
            array = JSON.parse(fse.readFileSync(DEFAULT_DATA_PATH + folder + `/` + jsonname, 'utf8'));
        } catch (e) {
            console.log(e.message);
        }
        return array; //参照渡しできない連想配列用
    };

    ServerSettingLoad() { //サーバー設定読込
        this.setting = this.json_read(`setting.json`, this.setting);
    };
    init(ServerId) {
        this.id = ServerId;
        this.ServerSettingLoad();
        this.ServerNameLoad();
    }
    ServerNameLoad() { //サーバーに名前置換テーブル読込
        this.name_touroku = this.json_read(`namedata.json`, this.name_touroku);
    };
    omittedContent_guild(userid, GuildObject) {
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
            user_name = GuildObject.members.resolve(`${userid}`).user.username;
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
    ClientInit(client) {
        this.client = client;
    }
}


Amana_tenko_start = function(message, Amana_data, Amana) {
    for (let i = 0; i < Amana_data.setting["tenko_trigger"].length; i++) {
        if (message.content === Amana_data.setting["tenko_trigger"][i]) {
            //一致時
            let author = message.author.username;

            message_react(message);
            Amana_data.message_send(`甘奈が数えるよ～☆`)

            //ツイート
            if (message.content !== '/amana tenko debug') {
                const currentTime = Amana.TimeFormat('HH24:MI:SS');
                Amana_data.tweetPost(`${author}が点呼を開始したよ☆(${currentTime})`);
            }
            //配列を空にする
            Amana_data.tenko_reset();
        }
    }
}

Amana_hat_start = function(client, channelid, Amana_data, Amana) {
    //////////////////////////////////////////////////////////////
    //                                                          //
    //  組分けコマンド　                                        　//
    //                                                          //
    //////////////////////////////////////////////////////////////

    Channel_send_in(client, channelid, `${Amana_data.kumi_mode_call()+3}人優先モードで組分けするよ～☆`);



    let kumi_name = [];
    kumi_name = Amana_data.kumi_name_call();

    let reply_text = '';

    //分けられないやつ
    if (Amana_data.name_array.length == 0) {
        Channel_send_in(client, channelid, `誰もいないみたいだよ～？`);
        return;
    }
    if (Amana_data.name_array.length == 1 | Amana_data.name_array.length == 2 | Amana_data.name_array.length == 5) {
        Channel_send_in(client, channelid, `${Amana_data.name_array.length}人だと分けられないから、やり直してね！`);
        return;
    }

    console.log(`シャッフル前：${Amana_data.name_array}`);
    Amana.shuffleArray(Amana_data.name_array);
    console.log(`シャッフル後：${Amana_data.name_array}`);

    Amana.shuffleArray(kumi_name);

    //データコピー
    Amana_data.name_list_array = Amana_data.name_array.slice(0, Amana_data.name_array.length);
    //name_list_arrayを
    for (let i = 0; i < Amana_data.name_list_array.length; i++) {
        Amana_data.name_list_array[i] = Amana_data.omittedContent(Amana_data.name_list_array[i]); //userクラスの配列をusername配列(または置換済みデータ)に変える
    }


    //分けるやつ


    //分け方
    Amana_data.kumi_array = [];
    //3i + 4j = name_array.lengthなので
    (function() { //組分け配列のため、何人ずつ分けるか判別
        const mode = Amana_data.kumi_mode_call() + 3;
        const KUMI_3 = 3;
        const KUMI_4 = 4;

        const len = Amana_data.name_array.length;
        let kumi_kumiawase_array = [0, 0]; //i,jの順番に入れる

        //mode==3のとき、iが大きい方から組み合わせ探索し最初に見つかったものを出力
        onloop: if (mode == KUMI_3) {
                for (let i = len; i >= 0; i--) {
                    for (let j = 0; j < len; j++) {
                        if (KUMI_3 * i + KUMI_4 * j == len) {
                            //組み合わせ発見時
                            kumi_kumiawase_array = [i, j];
                            break onloop;
                        }
                    }
                }
            }

            //mode==4のとき、jが大きい方から組み合わせ探索し最初に見つかったものを出力
        onloop: if (mode == KUMI_4) {
                for (let j = len; j >= 0; j--) {
                    for (let i = 0; i < len; i++) {
                        if (KUMI_3 * i + KUMI_4 * j == len) {
                            //組み合わせ発見時
                            kumi_kumiawase_array = [i, j];
                            break onloop;
                        }
                    }
                }
            }

        for (let i = 1; i <= kumi_kumiawase_array[0]; i++) {
            Amana_data.kumi_array.push(KUMI_3);
        }
        for (let j = 1; j <= kumi_kumiawase_array[1]; j++) {
            Amana_data.kumi_array.push(KUMI_4);
        }

    }());


    //特殊処理
    if (Amana_data.name_array.length == 10 && Math.floor(Math.random() * 5) == 0) {
        //10人かつ、20%の確率でなります
        kumi_name = [`なんでや！`, `阪神関係`, `ないやろ！`];
    }

    //組名がundefinedになりそうなときは抗う
    if (Amana_data.kumi_array.length > kumi_name.length) {
        for (let key in Amana_data.kumi_name) {
            if (Amana_data.kumi_name[key].length >= Amana_data.kumi_array.length) {
                kumi_name = Amana_data.kumi_name[key].slice(0, Amana_data.kumi_name[key].length);
                break;
            }
        }
    }

    reply_text = `■　組分け発表 (総数：${Amana_data.name_array.length} 人)\n`;


    console.log("組分け開始");
    console.log(Amana_data.kumi_array);

    for (let i = 0; i < Amana_data.kumi_array.length; i++) {
        console.log(`${i}`);
        reply_text += `${i+1}. ${kumi_name[i]} [ ${Amana_data.kumi_array[i]} ]\n`;

        for (let j = 0; j < Amana_data.kumi_array[i]; j++) {
            console.log(`${i},${j}`);
            reply_text += `　${Amana_data.name_list_array[j]}`;
        }
        reply_text += `\n`;
        for (let j = 0; j < Amana_data.kumi_array[i]; j++) {
            console.log(`${i},${j}`);
            Amana_data.name_list_array.shift();
        }
    }

    Channel_send_in(client, channelid, reply_text);
    return;


};

Amana_count_in = function(message, Amana_data) {

    for (let i = 0; i < Amana_data.setting["tenko_count"].length; i++) {
        if (message.content === Amana_data.setting["tenko_count"][i]) {
            //一致時
            const author = message.author.username;
            const mes_id = message.author.id;
            message_react(message);

            Amana_data.tenko_count(mes_id);
            console.log(`ネーム配列　に　${mes_id} : ${author}を追加しました`);

            return;
        }
    }
}
Amana_list_in = function(Amana_data) {

    //////////////////////////////////////////////////////////////
    //                                                          //
    //  点呼表示　　                                             //
    //                                                          //
    //////////////////////////////////////////////////////////////
    let reply_text = `参加者一覧の表示をするよ！\n`;
    if (Amana_data.name_array.length == 0) {
        reply_text += `……いないよ！\n`;
    } else {
        reply_text += `${Amana_data.name_array.length}人いるよ！\n`;

        for (let i = 0; i < Amana_data.name_array.length; i++) {
            reply_text += `${Amana_data.omittedContent(Amana_data.name_array[i])}　`;
        }
    }
    return reply_text;

}


function Channel_send_in(client, channelid, message) {
    client.channels.cache.get(channelid).send(message)
        .then(message => console.log(`${channelid} : 甘奈「${message}」`))
        .catch(console.error);
}

function message_react(message) {

    message.react('⭐')
        .then(message => console.log(`甘奈確認！`))
        .catch(console.error);
}

module.exports = {
    Amana_minimum: Amana_minimum,
    Amana_tenko: function(message, Amana_data, Amana) {
        Amana_tenko_start(message, Amana_data, Amana);
    },
    Amana_hat: function(client, channelid, Amana_data, Amana) {
        Amana_hat_start(client, channelid, Amana_data, Amana);
    },
    Channel_send: function(client, channelid, message) {
        Channel_send_in(client, channelid, message);
    },
    Amana_count: function(message, Amana_data) {
        Amana_count_in(message, Amana_data);
    },
    Amana_list: function(Amana_data) {
        return Amana_list_in(Amana_data);
    },
    json_default_read: function(jsonname, array) {
        try {
            array = JSON.parse(fse.readFileSync(DEFAULT_DATA_PATH + jsonname, 'utf8'));
        } catch (e) {
            console.log(e.message);
        }
        return array; //参照渡しできない連想配列用
    }

}