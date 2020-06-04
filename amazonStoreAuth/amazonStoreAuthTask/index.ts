import tl = require('azure-pipelines-task-lib/task');
import https = require('https')
import querystring = require('querystring');

async function run() {
    console.log('Start authentication');

    try {
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

        const hostname = 'api.amazon.com';
        const tokenPath = '/auth/o2/token'
        const data = querystring.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
            scope: "appstore::apps:readwrite"
        });

        const options = {
            hostname: hostname,
            port: 443,
            path: tokenPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        }

        const req = https.request(options, (res) => {
            console.log(`Api call status code: ${res.statusCode}`)

            var result = '';
            res.on('data', function (chunk) {
                result += chunk;
            });

            res.on('end', function () {
                var obj = JSON.parse(result.toString());
                var accessToken = obj.access_token;

                console.log(`Access token = ${accessToken}`);

                tl.setVariable('AmazonAuthToken', `${accessToken}`);
                tl.setResult(tl.TaskResult.Succeeded, "Success");
            });
        })

        req.on('error', (error) => {
            console.log(`error: ${error}`);
            tl.setResult(tl.TaskResult.Failed, error.message);
        })

        req.write(data);
        req.end();

    }
    catch (err) {
        console.log(`error: ${err}`);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();