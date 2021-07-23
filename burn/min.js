//最低限のデータセット
//json書込・読込
const DEFAULT_DATA_PATH = __dirname + `/../../burning_bot_data/`;

//fs-extra
const fs = require('fs-extra');


class Burn_minimum {
    constructor() {

        //サーバー情報取得
        this.id = 0; //鯖ID
        this.client;

        //サーバー設定
        this.setting = {}; //設定は連想配列

        //名前配列関係
        this.name_touroku = {}; //名前置換テーブル(連想配列)

    }


    //Json読み書き
    json_read_default(jsonname, array, path = DEFAULT_DATA_PATH) {
        try {
            array = JSON.parse(fs.readFileSync(path + jsonname, 'utf8'));
        } catch (e) {
            console.log(e.message);
        }
        return array; //参照渡しできない連想配列用
    };
    json_write(jsonname, array) {
        try {
            fs.writeFileSync(DEFAULT_DATA_PATH + this.id + `/` + jsonname, JSON.stringify(array));
        } catch (e) {
            console.log(e.message);
        }
        return;
    };
    json_read(jsonname, array, folder = this.id) {
        //ファイル存在確認
        if (!fs.existsSync(DEFAULT_DATA_PATH + folder + `/` + jsonname)) {
            //ないとき
            folder = `default`;
        }
        try {
            array = this.json_read_default(jsonname, array, DEFAULT_DATA_PATH + folder)
        } catch (e) {
            console.log(e.message);
        }
        return array; //参照渡しできない連想配列用
    };

    ServerSettingLoad() { //サーバー設定読込
        this.setting = this.json_read(`setting.json`, this.setting);
    };
    init(client, GuildId) {
        this.client = client;
        this.id = GuildId;
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
    Channel_send(channelid, message) {
        this.client.channels.cache.get(channelid).send(message)
            .then(message => console.log(`${channelid} : ${message}`))
            .catch(console.error);
    }
}
exports.Burn_minimum = Burn_minimum;


exports.Burn_DirExistCheck = function Burn_DirExistCheck(guild) {

    //設定ファイル関係がなかったら困るので
    const DEFAULT_PATH = DEFAULT_DATA_PATH + `default` + `/`;

    let NOW_ID_PATH = ``;
    try {
        NOW_ID_PATH = DEFAULT_DATA_PATH + guild.id + `/`;
        console.log("ギルドIDモード")
    } catch (e) {
        NOW_ID_PATH = DEFAULT_DATA_PATH + channel.id + `/`;
        console.log("チャンネルIDモード")
    }
    if (fs.existsSync(NOW_ID_PATH)) {
        //存在するのでそのまま
        console.log(`ディレクトリ：${NOW_ID_PATH}を検出！`)
    } else {
        console.log(`ディレクトリ：${NOW_ID_PATH}は存在しません`);

        fs.copySync(DEFAULT_PATH, NOW_ID_PATH);
        console.log(`ディレクトリ：${NOW_ID_PATH}が作成されました`);
    }

};