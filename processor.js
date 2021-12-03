
const smst = require('./smst');
const dbOps = require('./dbops');

async function doProcess(body) {
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
    }
    return {
        ...user
    }
}

module.exports = {
    doProcess,
}