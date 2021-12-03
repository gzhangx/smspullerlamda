
const processor = require('./processor');
const { replyToMessage } = require('./awsutil');

function parseBody(body) {
    if (!body) return {
        error:'Null body'
    };
    try {
        return {
            ok: JSON.parse(body),
        }
    } catch {
        return {
            error: `failed to parse body:${body}`,
        }
    }
}
exports.handler = async (event) => {
    // TODO implement
    console.log('got event');
    console.log(event);
    const { routeKey, connectionId } = event.requestContext || {};
    const body = parseBody(event.body);    
    switch (routeKey) {
        case '$connect':
            console.log('connected');
            break;
        case '$disconnect':
            console.log('disconnected');
            break;
        case '$default':
        case 'message':
        case 'getMessages':
            console.log(`message receive ${routeKey}, responding to ${connectionId}`);
            await replyToMessage(body.ok ? await processor.doProcess(body.ok, msg => replyToMessage(msg, connectionId), connectionId):body, connectionId)
            break;
        default:
            console.log('unknown route ' + routeKey);
        break;
    }
    const response = {
        statusCode: 200,
        body:'done',
    };
    return response;
};

