import tl = require('azure-pipelines-task-lib/task');
import https = require('https')
import querystring = require('querystring');

async function run() {
    console.log('Start create or edit');
	tl.setResult(tl.TaskResult.Succeeded, "Success");
}

run();