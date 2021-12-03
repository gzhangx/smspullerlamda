const db = require('./db');
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
    return {
        ...user
    }
}

module.exports = {
    doProcess,
}