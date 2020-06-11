import { EditListing } from "../model/edit-listing";
import { EditListingResult } from "../model/edit-listing-result";

export class Api {

    private endpoint = "https://developer.amazon.com/api/appstore/v1/applications";
    private request = require('sync-request');

    constructor(private appId: string, private editId: string, private token: string) { }

    getEditWithEtag(language: string): EditListingResult {
        var options = { 'headers': { 'Authorization': `bearer ${this.token}`, "accept": "application/json" } };
        var res = this.request('GET', `${this.endpoint}/${this.appId}/edits/${this.editId}/listings/${language}`, options);
        if (res.statusCode == 200) {
            console.log(`Retrieve edit with etag success`);
            var obj = JSON.parse(res.getBody());
            return new EditListingResult(obj, res.headers.etag);
        } else {
            throw `Retrieve edit with etag fail. Code: ${res.statusCode}. Resp: ${res.getBody()}`;
        }
    }

    editUpdate(language: string, etag: string, currentListing: EditListing, updateListing: EditListing) {
        if (updateListing.title != undefined) currentListing.title = updateListing.title
        if (updateListing.shortDescription != undefined) currentListing.shortDescription = updateListing.shortDescription
        if (updateListing.fullDescription != undefined) currentListing.fullDescription = updateListing.fullDescription
        if (updateListing.recentChanges != undefined) currentListing.recentChanges = updateListing.recentChanges
        if (updateListing.featureBullets != undefined) currentListing.featureBullets = updateListing.featureBullets
        if (updateListing.keywords != undefined) currentListing.keywords = updateListing.keywords
        var options = {
            'headers': {
                'Authorization': `bearer ${this.token}`,
                "accept": "application/json",
                "Content-Type": "application/json",
                'If-Match': etag
            },
            'body': JSON.stringify(currentListing)
        };
        var res = this.request('PUT', `${this.endpoint}/${this.appId}/edits/${this.editId}/listings/${language}`, options);
        if (res.statusCode != 200) {
            throw `Edit update fail. Code: ${res.statusCode}. Resp: ${res.getBody()}`;
        }
    }
}