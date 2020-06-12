export class Api {

    private endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
    private request = require('sync-request');

    constructor(private appId: string, private editId: string, private token: string) { }

    getEditEtag(): string {
        var options = { 'headers': { 'Authorization': `bearer ${this.token}`, "accept": "application/json" } };
        var res = this.request('GET', `${this.endpoint}/${this.appId}/edits/${this.editId}`, options);
        if (res.statusCode == 200) {
            console.log(`Retrieve edit etag success`);
            return res.headers.etag;
        } else {
            throw `Retrieve edit etag fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }

    commitUpdate(etag: string) {
        var options = {
            'headers': {
                'Authorization': `bearer ${this.token}`,
                "accept": "application/json",
                'If-Match': etag
            }
        };
        var res = this.request('POST', `${this.endpoint}/${this.appId}/edits/${this.editId}/commit`, options);

        if (res.statusCode == 200) {
            var obj = JSON.parse(res.getBody().toString());
            console.log(`Commit update. Status: ${obj.status} | Id: ${obj.id}`);
        } else {
            throw `Commit update fail. Code: ${res.statusCode}. Resp: ^${res.getBody()}`;
        }
    }
}