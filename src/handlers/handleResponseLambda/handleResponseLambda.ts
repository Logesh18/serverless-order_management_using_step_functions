import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const snsClient: any = new SNSClient({ region: 'us-east-1' });
const sqsClient: any = new SQSClient({ region: 'us-east-1' });

export const handler = async (event: any): Promise<string> => {
    console.log('handleResponse---->', event);
    try {
        let message: string = '';

        if (event.unprocessed_orders) {
            message =
                event.order_quantity === event.unprocessed_orders
                    ? `None of the ${event.order_quantity} orders has been processed.`
                    : `Out of ${event.order_quantity} orders ${event.unprocessed_orders} have yet to be processed due to insufficient stock.`;
            const err = new Error('Unprocessed Orders');
            await sendToDLQ(event, err);
        } else {
            message = `All the orders have been successfully processed.`;
        }
        await sendEmail(message);
        return 'Orders get processed successfully';
    } catch (error: any) {
        console.log('error---->', error);
        return 'Failed to process the response';
    }
};

const sendEmail = async (message: string) => {
    const params = {
        Message: message,
        Subject: 'Order Process Details',
        TopicArn: process.env.SNS_TOPIC_ARN,
    };
    try {
        await snsClient.send(new PublishCommand(params));
        console.log('Mail sent Successfully');
    } catch (err: any) {
        console.log('Failed to send mail', err);
    }
};

const sendToDLQ = async (event: any, error: any) => {
    const dlqParams: any = {
        QueueUrl: process.env.DLQ_QUEUE_URL,
        MessageBody: JSON.stringify({
            event,
            error: error.toString(),
            timestamp: new Date().toISOString(),
        }),
    };
    await sqsClient.send(new SendMessageCommand(dlqParams));
};
