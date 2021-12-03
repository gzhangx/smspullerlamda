const db = require('./dbops');
const smst = require('./smst');

const { replyToMessage } = require('./awsutil');

const credentials = require('./credentials.json');
async function test(username, phone)
{
    await smst.deleteAll();
    const user = await db.getUserByName(username);
    console.log(user);
    const twilioSid = user.twilioSid;
    smst.checkSms(twilioSid, phone, async msg => {
        console.log(`got msg ${msg.body}`);
        replyToMessage(msg, 'test')
    });
}

test('ericktest6', credentials.twilio.myPhone);