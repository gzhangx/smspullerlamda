const AWS = require('aws-sdk');

const api = new AWS.ApiGatewayManagementApi({
    endpoint: '6jpn0ivmf6.execute-api.us-east-2.amazonaws.com/production'
});


async function replyToMessage(response, connectionId) {
    const params = {
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(response))
    }

    return api.postToConnection(params).promise()
}


module.exports = {
    replyToMessage,
}