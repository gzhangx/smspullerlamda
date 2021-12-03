const db = require('./db');
async function process(body) {
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

    return {
        ...user
    }
}

module.exports = {
    process,
}