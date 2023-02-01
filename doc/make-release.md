# How to release Opencast Studio

Checkout the branch `master` from Opencast Studio and make sure it is up-to-date (working directory should be clean!).
Execute `./create-release.sh`. Now there should be two new `*.tar.gz` files.

## Release

Go to [the release section on GitHub](https://github.com/elan-ev/opencast-studio/releases) and click "Draft a new release". Click on "choose a tag" and enter the current date in YYYY-MM-DD and then "Create new tag".
Make sure the target is still `master`.
As a release title, enter the current date again in the same format.
List all changes (since the last release) in the text box.
Upload the two `*.tar.gz` files and click "Publish release".

## Update Opencast

Checkout a new branch.
Go to `modules/studio/pom.xml`. You have to change two lines:
- `<opencast.studio.url>`: change the url to the new relase-url from `*-integrated.tar.gz`. (Usually only the date has to be adjusted here.)
- `<opencast.studio.sha256>`: update the sha256 hash. (Run `sha256sum *-integrated.tar.gz` in Opencast Studio folder)
 Open a new pull request (optional: add a link to the release and changelog in the description)

 Before opening a new pull request, you can build Opencast and test Opencast Studio. The release date should be on the info page.
