import tl = require('azure-pipelines-task-lib/task');
import querystring = require('querystring');

async function run() {
    console.log('- Start authentication');

    try {
        var request = require('sync-request');

        const clientId: string | undefined = tl.getInput('clientId', true);
        if (clientId == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'ClientId is required');
            return;
        }
        const clientSecret: string | undefined = tl.getInput('clientSecret', true);
        if (clientSecret == undefined) {
            tl.setResult(tl.TaskResult.Failed, 'ClientSecret is required');
            return;
        }
        const data = querystring.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
            scope: "appstore::apps:readwrite"
        });

        var options = {
            'headers': { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length },
            'body': data
        };

        var res = request('POST', `https://api.amazon.com/auth/o2/token`, options);
        console.log(res);

        if (res.statusCode = 200) {
            console.log(`POST - Authenticate success`);
            var obj = JSON.parse(res.getBody().toString());

            tl.setVariable('AmazonAccessToken', `${obj.access_token}`);
            tl.setResult(tl.TaskResult.Succeeded, "Success");
        } else {
            throw `POST - Authenticate fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }
    catch (err) {
        console.log(`- Error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();