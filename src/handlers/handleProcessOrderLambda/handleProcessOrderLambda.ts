import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SFNClient, SendTaskFailureCommand, SendTaskSuccessCommand } from '@aws-sdk/client-sfn';

const dynamoDBClient: any = new DynamoDBClient({ region: 'us-east-1' });
const client: any = DynamoDBDocumentClient.from(dynamoDBClient);
const stepFunctions: any = new SFNClient({ region: 'us-east-1' });

export const handler = async (event: any) => {
    console.log('event--->', event);
    const unProcessedOrders: number = event.result.filter((value: any) => !value).length;

    const response: any = {
        order_id: event.orderArray[0].order_id,
        product_id: event.orderArray[0].product_id,
        order_quantity: event.orderArray.length,
        unprocessed_orders: unProcessedOrders
    };

    try {
        const updateParams: any = {
            TableName: process.env.ORDER_TABLE_NAME,
            Key: {
                order_id: event.orderArray[0].order_id
            },
            UpdateExpression: 'SET #unprocessed_orders = :unProcessedOrders',
            ExpressionAttributeNames: { '#unprocessed_orders': 'unprocessed_orders' },
            ExpressionAttributeValues: { ':unProcessedOrders': unProcessedOrders }
        };

        const updateItemCommand: any = new UpdateCommand(updateParams);

        await client.send(updateItemCommand);
        const sendTaskSuccessCommand: any = new SendTaskSuccessCommand({
            taskToken: event.TaskToken,
            output: JSON.stringify(response)
        });

        await stepFunctions.send(sendTaskSuccessCommand);
        return true;
        // if (!unProcessedOrders) {
        //     const sendTaskSuccessCommand: any = new SendTaskSuccessCommand({
        //         taskToken: event.TaskToken,
        //         output: JSON.stringify(response)
        //     });

        //     await stepFunctions.send(sendTaskSuccessCommand);
        //     return true;
        // } else {
        //     const sendTaskFailureCommand: any = new SendTaskFailureCommand({
        //         taskToken: event.TaskToken,
        //         error: 'Out of stock',
        //         cause: JSON.stringify(response),
        //     });

        //     await stepFunctions.send(sendTaskFailureCommand);
        //     return false;
        // }
    } catch (error) {
        console.log('error------>', error);
        const sendTaskFailureCommand: any = new SendTaskFailureCommand({
            taskToken: event.TaskToken,
            error: JSON.stringify(error),
            cause: JSON.stringify(response)
        });

        await stepFunctions.send(sendTaskFailureCommand);
        return false;
    }
};
