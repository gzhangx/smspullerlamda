const AWS = require('aws-sdk');

// The AWS Region that you want to use to send the message. For a list of
// AWS Regions where the Amazon Pinpoint API is available, see
// https://docs.aws.amazon.com/pinpoint/latest/apireference/.
const aws_region = "us-east-1";

// The phone number or short code to send the message from. The phone number
// or short code that you specify has to be associated with your Amazon Pinpoint
// account. For best results, specify long codes in E.164 format.
const originationNumber = "+18558021929";

// The recipient's phone number.  For best results, you should specify the
// phone number in E.164 format.
var destinationNumber = "+14043989999";

//acfb7b22914444be85bd4e50529a2909
var message = "sometest";

const applicationId = 'acfb7b22914444be85bd4e50529a2909';

// The type of SMS message that you want to send. If you plan to send
// time-sensitive content, specify TRANSACTIONAL. If you plan to send
// marketing-related content, specify PROMOTIONAL.
const messageType = "TRANSACTIONAL";

// The registered keyword associated with the originating short code.
const registeredKeyword = "myKeyword";

// The sender ID to use when sending the message. Support for sender ID
// varies by country or region. For more information, see
// https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms-countries.html
const senderId = "MySenderID";

// Specify that you're using a shared credentials file, and optionally specify
// the profile that you want to use.
const SESConfig = {
    apiVersion: "2010-12-01",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: aws_region
}

// Specify the region.
AWS.config.update({ region: aws_region });

//Create a new Pinpoint object.
const pinpoint = new AWS.Pinpoint();

const params = {
    ApplicationId: applicationId,
    MessageRequest: {
        Addresses: {
            [destinationNumber]: {
                ChannelType: 'SMS'
            }
        },
        MessageConfiguration: {
            SMSMessage: {
                Body: message,
                Keyword: registeredKeyword,
                MessageType: messageType,
                OriginationNumber: originationNumber,
                SenderId: senderId,
            }
        }
    }
};

pinpoint.sendMessages(params, function (err, data) {
    // If something goes wrong, print an error message.
    if (err) {
        console.log(err.message);
        // Otherwise, show the unique ID for the message.
    } else {
        console.log("Message sent! "
            + data['MessageResponse']['Result'][destinationNumber]['StatusMessage']);
    }
});