const db = require('./dbops');
const smst = require('./smst');

const { replyToMessage } = require('./awsutil');

const credentials = require('./credentials.json');
const { MessagingConfigurationList } = require('twilio/lib/rest/verify/v2/service/messagingConfiguration');
async function test(username, phone)
{
    //await smst.deleteAll();
    const user = await db.getUserByName(username);
    console.log(user);
    const twilioSid = user.twilioSid;
    smst.checkSms(twilioSid, phone, async msg => {
        console.log(`got msg ${msg.body}`);
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
}

return smst.getAllMessages(credentials.twilio.serviceSidDontUse, msgs => {
    console.log(msgs);
})
test('ericktest6', credentials.twilio.myPhone);