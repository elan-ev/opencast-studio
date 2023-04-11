# How to cut a release for Opencast

1. Switch to the commit you want to turn into the release
2. Create and push a new tag
   ```bash
    DATE=$(date +%Y-%m-%d)
    git tag -m Release -s "$DATE"
    git push upstream "$DATE":"$DATE"
   ```
3. Wait for the [Create release draft](https://github.com/opencast/opencast-studio/actions/workflows/create-release.yml)
   to finish
    - it will create a new [GitHub release draft](https://github.com/opencast/opencast-studio/releases)
    - review and publish the draft
4. Submit a pull request against Opencast
    - [Update the release](https://github.com/opencast/opencast/blob/b2bea8822b95b8692bb5bbbdf75c9931c2b7298a/modules/studio/pom.xml#L16-L17)
    - [Adjust the documentation](https://github.com/opencast/opencast/blob/b2bea8822b95b8692bb5bbbdf75c9931c2b7298a/docs/guides/admin/docs/modules/studio.md)
      if necessary
    - [Update the configuration](https://github.com/opencast/opencast/blob/b2bea8822b95b8692bb5bbbdf75c9931c2b7298a/etc/ui-config/mh_default_org/studio/    studio-settings.toml)
      if necessary
    - Verify that the new release runs in Opencast, then create the pull request.
