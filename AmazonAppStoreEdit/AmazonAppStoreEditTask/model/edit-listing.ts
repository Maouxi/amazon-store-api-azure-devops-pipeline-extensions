export class EditListing {
    constructor(
        public language: string,
        public title: string | undefined,
        public fullDescription: string | undefined,
        public shortDescription: string | undefined,
        public recentChanges: string | undefined,
        public featureBullets: Array<string> | undefined,
        public keywords: Array<string> | undefined) {
    }
}
