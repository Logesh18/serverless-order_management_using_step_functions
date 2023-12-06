import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

const stepFunctionsClient: any = new SFNClient();

export const handler = async (event: any) => {
    console.log('event---->', event);
    const params: any = {
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        name: event.Records[0].messageId,
        input: event.Records[0].body,
    };

    try {
        const result: any = await stepFunctionsClient.send(new StartExecutionCommand(params));
        console.log(`Step Function execution started: ${result.executionArn}`);
        return "Step Function execution started successfully!";
    } catch (err: any) {
        console.error("Error starting Step Function execution: " + err);
        throw err;
    }
};
