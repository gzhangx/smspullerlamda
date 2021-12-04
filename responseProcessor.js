const Promise = require('bluebird');
const uuid = require('uuid');
const dbOps = require('./dbops');
const { replyToMessage } = require('./awsutil');

async function processResonse(event) {
    console.log(event);
    //console.log(event.Records[0].Sns.Message);    
    //'{"originationNumber":"+14043989999","destinationNumber":"+18558021929","messageKeyword":"KEYWORD_986423703153","messageBody":"Gggj","previousPublishedMessageId":"rlchs1is7elkovhdorlp2gm02sf6hmbps2ijvsg0","inboundMessageId":"f0bc4709-06ef-406f-8e24-8b3ccb6c593a"}'

    const timestamp = new Date().toISOString();;
    const ress = await Promise.map(event.Records, async record => {
        const msg = record.Sns.Message;
        msg.source = 'sms';
        msg.id = msg.inboundMessageId || uuid.v1();
        msg.timestamp = timestamp;
        await dbOps.saveSmsMessage(msg);
        const msgDesc = `${msg.destinationNumber} ${msg.originationNumber} ${msg.messageBody}`;
        const user = await dbOps.getUserBySmsPhone(msg.destinationNumber);
        if (!user) {
            const error = (`Can't find user for msg ${msgDesc}`);
            console.log(error);
            return {
                ...msg ,
                error,
            }
        }
        if (user.smsConvId) {
            try {
                await replyToMessage(msg, user.smsConvId);
            } catch (err) {
                const error = `failed to send conv id ${msgDesc}`;
                console.log(error);
                return {
                    error,
                }
            }
        } else {
            const error = `failed to send conv id ${msgDesc}`;
            console.log(error);
            return {
                error,
            }
        }
        return msg;
    });
    const response = {
        statusCode: 200,
        body: ress,
    };
    return response;
}

module.exports = {
    processResonse,
}