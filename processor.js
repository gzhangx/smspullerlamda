
const smst = require('./smst');
const dbOps = require('./dbops');
const dbops = require('./dbops');

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

    await dbops.saveSmsConvId({
        id: twilioSid,
        connectionId,
        username,
    });
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
            await dbOps.saveSmsContacted({
                id: twilioSid,
                phone: body.number,
                username,
            });
            await smst.sendTextMsg(body.number, body.data);            
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
        }
    }
    return {
        ...user
    }
}

module.exports = {
    doProcess,
}