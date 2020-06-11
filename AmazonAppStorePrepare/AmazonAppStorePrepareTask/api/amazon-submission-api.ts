import querystring = require('querystring');

export class Api {

    private authEndpoint = "https://api.amazon.com/auth/o2/token";
    private endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
    private request = require('sync-request');

    constructor(private clientId: string, private clientSecret: string, private appId: string) { }

    getToken(): string {
        const data = querystring.stringify({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: "client_credentials",
            scope: "appstore::apps:readwrite"
        });

        var options = {
            'headers': { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length },
            'body': data
        };

        var res = this.request('POST', this.authEndpoint, options);

        if (res.statusCode = 200) {
            console.log(`Authenticate success`);
            var obj = JSON.parse(res.getBody().toString());
            return obj.access_token;
        } else {
            throw `Authenticate fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }

    getOrCreateActiveEdit(token: string): string {
        var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
        var res = this.request('GET', `${this.endpoint}/${this.appId}/edits`, options);
        if (res.statusCode == 200) {
            var obj = JSON.parse(res.getBody().toString());
            console.log(`Retrieve active edits success. Status: ${obj.status} | Id: ${obj.id}`);
            if (obj.id == undefined) {
                console.log(`Retrieve active edits not found. Create a new edit.`);
                return this.createNewEdit(token);
            } else {
                return obj.id;
            }
        } else {
            throw `Retrieve active edits fail. Code: ${res.statusCode}`;
        }
    }

    private createNewEdit(token: string): string {
        var options = { 'headers': { 'Authorization': `bearer ${token}`, "accept": "application/json" } };
        var res = this.request('POST', `${this.endpoint}/${this.appId}/edits`, options);

        if (res.statusCode == 200) {
            var obj = JSON.parse(res.getBody().toString());
            console.log(`Create new edits success. Status: ${obj.status} | Id: ${obj.id}`);
            return obj.id;
        } else {
            throw `Create new edits. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }
}