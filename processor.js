
const smst = require('./smst');
const asms = require('./asms');
const dbOps = require('./dbops');
const uuid = require('uuid');

const getListenerKey = (sid, phone) => `${sid}-${smst.fixPhone(phone)}`;

async function doProcess(body, sendWs, connectionId) {
    const username = body.username;
    if (!username) {
        return {
            error:'No username',
        }
    }

    const user = await dbOps.getUserByName(username);
    if (!user) {
        return {
            error:'User not found'
        }
    }

    const twilioSid = user.twilioSid;
    if (!twilioSid) {
        return {
            error: 'User not setup for sms'
        }
    }

    let message = '';
    let res = null;
    await dbOps.updateSmsConvId(user.id, connectionId);
    switch (body.action) {
        case 'getMessages':
            const data = await smst.getAllMessages(twilioSid, async msgs => {
                //await dbOps.saveSmsMessages(msgs);
                return msgs;
            })
            return data;
        case 'sendMessage':
            if (!body.number || !body.number.match(/[0-9]{10,11}/g)) {
                return {
                    error: `Bad number ${body.number}`,
                }
            }
            const phone = asms.fixPhone(body.number);            
            res = await asms.sendMessage(user.asmsPhone, body.number, body.data, username);
            await dbOps.saveSmsMessage({
                id: uuid.v1(),
                ...res,
                data: body.data,
                username,
                phone,
                fromPhone: user.asmsPhone,
                timestamp: new Date().toISOString(),
            });
            message = 'Sent'
            break;
    }
    return {
        message,
        res,
    };
}

module.exports = {
    doProcess,
}