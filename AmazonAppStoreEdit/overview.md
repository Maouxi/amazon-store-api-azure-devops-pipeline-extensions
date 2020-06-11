This extension allow you to update and edit of the current update for an Amazon AppStore app publish. The [Prepare call to Amazon AppStore API](https://marketplace.visualstudio.com/items?itemName=MaxenceRaoux.amazon-app-store-prepare) need to be execute before this task to made an authentification and create/get the update edit.

Available tasks: 

- [Prepare task](https://marketplace.visualstudio.com/items?itemName=MaxenceRaoux.amazon-app-store-prepare)
- [Edit task](https://marketplace.visualstudio.com/items?itemName=MaxenceRaoux.amazon-app-store-edit)
- [Replace apk task](https://marketplace.visualstudio.com/items?itemName=MaxenceRaoux.amazon-app-store-replace-apk)
- [Commit task](https://marketplace.visualstudio.com/items?itemName=MaxenceRaoux.amazon-app-store-commit)

# Get started 

[GitHub project readme](https://github.com/Maouxi/amazon-store-api-azure-devops-pipeline-extensions)

# Task inputs
For optional input, leave empty the field to don't update them and keep old values. 

- appId: The package name or app identifier for the app
- language: The description language to udpate in ISO 639-1
- title: Display title
- shortDescription: A brief description of the app, shown on mobile devices.
- fullDescription: A lengthier description of the app, for the Appstore website
- recentChanges: The release note of this update
- featureBullets: Product feature bullets. One feature per line
- keywords: App keywords separate with ';'