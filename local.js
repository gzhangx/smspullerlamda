const Promise = require('bluebird');
const db = require('./dbops');
const smst = require('./smst');


const { replyToMessage } = require('./awsutil');

const credentials = require('./credentials.json');
const dbops = require('./dbops');

const allListeners = {

};

async function doSmsListening({ username, phone, twilioSid, id})
{    
    //const user = await db.getUserByName(username);
    if (!phone) {
        return console.log(`no phone for ${id} ${username}`);
    }
    //const twilioSid = user.twilioSid;    
    if (allListeners[id]) return;
    console.log(`creating conv for ${id} ${phone} ${username} ${twilioSid}`)
    try {
        const conv = await smst.checkSms(twilioSid, phone, async msg => {
            console.log(`got msg ${msg.body} from ${id}`);
            try {
                msg.belongsTo = username;
                await db.saveSmsMessages([msg]);
                const convId = await db.getSmsConvId(twilioSid);
                if (convId) {
                    await replyToMessage(msg, convId.connectionId);
                }
            } catch (exc) {
                console.log('failed to reply msg');
                console.log(exc);
            }
        });
        allListeners[id] = conv;
    } catch (exc) {
        console.log(`error on ${id} ${username}`);
        console.log(exc);
    }
}

async function keepListening() {
    await smst.deleteAll();
    while (true) {
        console.log('getting connections');
        await dbops.getAllSmsContacted(async (err, data) => {
            if (err) {
                console.log(err);
                return console.log("error getAllSmsConvIds ");
            }            
            Promise.map(data.Items, doSmsListening);
        });
        await Promise.delay(60000);
    }
    //doSmsListening('ericktest6', credentials.twilio.myPhone);
}

//return smst.getAllMessages(credentials.twilio.serviceSidDontUse, msgs => console.log(msgs));
keepListening();