//関数 VC_Role_Interlocking
//引数  oldState    voiceStateUpdateのoldState
//      newState    voiceStateUpdateのnewState
//      role_name   付与/剥奪するrole名

exports.VC_Role_Interlocking = function(oldState, newState, role_name) {

    if (oldState.channelId === null && newState.channelId != null) {
        //ここはconnectしたときに発火する場所

        //roleの取得
        const role = newState.guild.roles.cache.find(role => role.name === role_name);

        if (role) { //roleが正しく取得できたとき
            newState.guild.members.fetch(newState.id)
                .then((user) => {
                    user.roles.add(role);
                    console.log(`Guild:${newState.guild.name}\nUser:${user.id}\nStatus:${role} add`);
                })
        }
    }
    if (oldState.channelId != null && newState.channelId === null) {
        //ここはdisconnectしたときに発火する場所

        //roleの取得
        const role = newState.guild.roles.cache.find(role => role.name === role_name);

        if (role) { //roleが正しく取得できたとき
            newState.guild.members.fetch(newState.id)
                .then((user) => {
                    user.roles.remove(role);
                    console.log(`Guild:${newState.guild.name}\nUser:${user.id}\nStatus:${role} remove`);
                });
        }
    }
};