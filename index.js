var
    express = require('express'),
    app = express(),
    body = require('body-parser'),
    md5 = require('md5');

const Datastore = require('nedb')
const db = new Datastore({filename: 'users.json'})
main()
async function main() {
  await db.loadDatabase()
}
function dbFind(params) {
  return new Promise ((res, rej) => {
    db.find(params, (err, data) => {
      if (err) rej(err)
      return (data.length > 0) ? res(data) : res(false)
    })
  })   
}

var msgs = [];

app.use(body.urlencoded( { extended: true } ));
app.use(body.json());

app.get("/", (req,res) => {res.send('Index Page...')})

app.get("/api/v1/status", (req,res) => {res.json({status: 'Okay', msg: 'Made By coders'})})

app.get("/api/v1/startchat/:token/:chatname", async (req,res) => {
    var
        tokens = req.params.token,
        chatname = req.params.chatname;
    const all = await dbFind({isChat: true});
    var uu_id = Number(all.length) + 1;
    const all2 = await dbFind({token: tokens})
    if(all2[0] && all2[0].token == tokens){
    db.insert({creator_token: all2[0].token, chat_name: chatname, uuid: uu_id, isChat: true})
    msgs.push({isMeassage: true, uuid: uu_id, msg: `Chat successfull created! Admin: ${all2[0].login}. Server version: 0.0.1 for client version 0.0.2.`, username: all2[0].login})
    res.json({
        status: 'ok',
        uuid: uu_id,
        chatname: chatname,
        creator: all2[0].login
    })
} else {
    res.json({
        status: 'not ok',
        msg: 'invalid token'
    })
}
})

app.get("/api/v1/auth/:login/:pass", async (req,res) => {
    var
        logins = req.params.login,
        pass1 = req.params.pass,
        token = md5(`${logins}:${pass1}:@Coders2020`);
    const ress = await dbFind({login: logins})
    if(ress[0] && ress[0].login == logins){
        if(ress[0] && ress[0].pass == pass1){
            res.json({msg: 'ok', token: token})
        } else {
            res.json({msg:'error2'})
        }
    } else {
        res.json({msg: 'error1'})
    }
})

app.get("/api/v1/signup/:login/:pass", async (req,res) => {
    var
        logins = req.params.login,
        pass1 = req.params.pass,
        tokens = md5(`${logins}:${pass1}:@Coders2020`);
    const res1 = await dbFind({login: logins});
    if(res1[0] && res1[0].login == logins) {
        res.json({error: 'login exist!'})
    } else {
        db.insert({login: logins, pass: pass1, games: 0, score: 0, token: tokens})
        res.json({msg: 'ok'})
    }
})

app.get("/api/v1/insertchat/:token/:uuid", async (req,res) => {
    var
        tokens = req.params.token,
        uu_id = req.params.uuid,
        done = false;
    const getChatList = await dbFind({isChat: true});
    const user = await dbFind({token: tokens});
    if(user[0] && user[0].token == tokens) {
        for(b in getChatList){
        if(getChatList[b] && getChatList[b].uuid == parseInt(uu_id)) {
            done = true;

        } 
    }
    if(done) {
        db.insert({isMeassage: true, uuid: uu_id, msg: `${user[0].login} вошел в чат.`, username: user[0].login})
            res.json({
                status: 'ok'
            })
    } else {
        res.json({status: 'not ok'})
    }
    } else {
        res.json({status: 'not ok'})
    }
})

app.get("/api/v1/updatemsg/:token/:uuid", async (req,res) => {
        var
        tokens = req.params.token,
        uu_id = req.params.uuid;
        const getChatList = await dbFind({isChat: true});
        const user = await dbFind({token: tokens});
        var somelist = []
        if(user[0] && user[0].token == tokens) {
            for(b in getChatList) {              
            if(Number(getChatList[b].uuid) == Number(uu_id)) {
                for(i in msgs) {
                    if(msgs[i].uuid == parseInt(uu_id)) {
                        somelist.push({msg: msgs[i].msg, username: msgs[i].username})
                    }
                }
                
            } 
            }
            res.json({
                status: 'ok',
                meas: somelist[somelist.length - 1].msg,
                from: somelist[somelist.length - 1].username
            })
        } else {
            res.json({status: 'not ok1'})
        }
})

app.get("/api/v1/writemsg/:token/:uuid/:samomsg", async (req,res) => {
    var
        tokens = req.params.token,
        uu_id = req.params.uuid,
        soob = req.params.samomsg,
        isok = false;
    const getChatList = await dbFind({isChat: true});
    const user = await dbFind({token: tokens});
    if(user[0] && user[0].token == tokens) {
        for(i in getChatList) {
            if(getChatList[i] && getChatList[i].uuid == Number(uu_id)) {
                isok = true;
            }
        }
    if(isok) {
        res.json({status: 'ok'})
        msgs.push({isMeassage: true, uuid: uu_id, msg: soob, username: user[0].login})
    } else {
        res.json({status: 'not ok'})
    }
    } else {    
        res.json({status: 'not ok'})
    }
})

app.listen(3000, () => {
    console.log(`Server started.`)
})