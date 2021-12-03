
const smst = require('./smst');
const dbOps = require('./dbops');

const store = require('./store');
const getListenerKey = (sid, phone) => `${sid}-${smst.fixPhone(phone)}`;
const allListeners = store.store.allListeners;

async function doProcess(body, sendWs) {
    if (!body.username) {
        return {
            error:'No username',
        }
    }

    const user = await dbOps.getUserByName(body.username);
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

    switch (body.action) {
        case 'getMessages':
            const data = await smst.getAllMessages(twilioSid, async msgs => {
                await dbOps.saveSmsMessages(msgs);
                return msgs;
            })
            return data;
        case 'sendMessage': 
            if (!body.number || !body.number.match(/[0-9]{10,11}/g)) {
                return {
                    error: `Bad number ${body.number}`,
                }
            }
            return await smst.sendTextMsg(body.number, body.data);
        case 'token':
            const token = await smst.generateToken(body.username, twilioSid);
            return {
                token,
            };
        case 'listen': {
            if (!body.number || !body.number.match(/[0-9]{10,11}/g)) {
                return {
                    error: `Bad number ${body.number}`,
                }
            }
            const phone = body.number;
            const lk = getListenerKey(twilioSid, phone);
            let onMsg = null;
            if (!allListeners[lk]) {
                console.log(`adding listener for ${lk}`);
                onMsg = msg => {
                    sendWs(JSON.stringify(msg));
                }
                try {
                    console.log('checking sms')
                    const conv = await smst.checkSms(twilioSid, phone, onMsg, body.token);
                    allListeners[lk] = conv;
                } catch (exc) {
                    console.log('??????????????????? checksms error');
                    console.log(exc);
                }
            } else {
                console.log(`TODO: nooooooooooooooooo, adding listener for ${lk}`);
            }
            
        }
    }
    return {
        ...user
    }
}

module.exports = {
    doProcess,
}