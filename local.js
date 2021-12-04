const Promise = require('bluebird');
const db = require('./dbops');
const smst = require('./smst');


const { replyToMessage } = require('./awsutil');

const credentials = require('./credentials.json');
const dbops = require('./dbops');

const allListeners = {

};

async function doSmsListening({ username, phone ,id})
{
    //await smst.deleteAll();
    //const user = await db.getUserByName(username);
    if (!phone) {
        return console.log(`no phone for ${id} ${username}`);
    }
    const twilioSid = id; //user.twilioSid;    
    if (allListeners[id]) return;
    console.log(`creating conv for ${id} ${phone} ${username}`)
    const conv = await smst.checkSms(twilioSid, phone, async msg => {
        console.log(`got msg ${msg.body}`);
        try {
            msg.belongsTo = username;
            await db.saveSmsMessages([msg]);
            const convId = await db.getSmsConvId(twilioSid);
            console.log(`convid is ${convId}`)
            if (convId) {
                await replyToMessage(msg, convId.connectionId);
            }
        } catch (exc) {
            console.log('failed to reply msg');
            console.log(exc);
        }
    });
    allListeners[id] = conv;
}

async function keepListening() {
    while (true) {
        console.log('getting connections');
        await dbops.getAllSmsContacted((err, data) => {
            if (err) {
                console.log(err);
                return console.log("error getAllSmsConvIds ");
            }
            await Promise.map(data.Items, itm => doSmsListening);
        });
        await Promise.delay(60000);
    }
    //doSmsListening('ericktest6', credentials.twilio.myPhone);
}

keepListening();