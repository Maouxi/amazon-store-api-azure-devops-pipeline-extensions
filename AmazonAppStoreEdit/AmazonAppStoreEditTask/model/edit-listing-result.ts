import { EditListing } from './edit-listing';

export class EditListingResult {
    constructor(public value: EditListing, public etag: string) { }
}