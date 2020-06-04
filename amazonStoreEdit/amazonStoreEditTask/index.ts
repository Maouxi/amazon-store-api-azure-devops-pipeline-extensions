import tl = require('azure-pipelines-task-lib/task');
import https = require('https')
import querystring = require('querystring');

async function run() {
    console.log('Start create or edit');

    var token = tl.getVariable("AmazonAuthTask.AmazonAuthToken")
    console.log(`Token: ${token}`);
    
	tl.setResult(tl.TaskResult.Succeeded, "Success");
}

run();