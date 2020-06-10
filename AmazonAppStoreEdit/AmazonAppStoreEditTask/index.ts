import tl = require('azure-pipelines-task-lib/task');
import querystring = require('querystring');

var endpoint = "https://developer.amazon.com/api/appstore/v1/applications";

async function run() {
    console.log('== Start Amazon Submission API preparation ==');

    try {
        var token = tl.getVariable("AmazonAppStorePrepareTask.AmazonAccessToken");
        var editId = tl.getVariable("AmazonAppStorePrepareTask.AmazonEditId");
        if (token == undefined || editId == undefined) {
            tl.setResult(tl.TaskResult.Failed, `You need to use the 'prepare' task first`);
            return;
        }
    
        const appId: string | undefined = tl.getInput('appId', true);
        if (appId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'AppId is required');
            return;
        }

        //TODO : do something

        tl.setResult(tl.TaskResult.Succeeded, `Successfully update the editId: ${editId}`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

}

run();