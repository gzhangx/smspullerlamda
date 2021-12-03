const db = require('./db');
const smst = require('./smst');
const Promise = requrie('bluebird');

async function doProcess(body) {
    if (!body.username) {
        return {
            error:'No username',
        }
    }

    const user = await db.getOneByName(process.env.USER_TABLE_NAME, 'username', body.username);
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
                return Promise.map()
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