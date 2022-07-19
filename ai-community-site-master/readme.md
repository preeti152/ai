### Quick Links
[Jenkins pipeline status](https://jenkins-micro-site-automation.origin-elr-core.optum.com/job/ai-community/)

### Requirements
Before getting started, make sure you have the following installed:
- [Node.js](https://nodejs.org) v12 or later
- [Yarn](https://yarnpkg.com)
- [git](https://git-scm.com) v2.14.1 or later 

### Installation
```bash
$ yarn
```

### Local Development
```bash
$ yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

### Build
```bash
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment
```bash
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch. Make sure to update the following configuration options in `docusaurus.config.js`:

```javascript
module.exports = {
  url: 'https://github.optum.com/pages/tto/vanilla-docusaurus',
  baseUrl: '/pages/tto/vanilla-docusaurus/',
  organizationName: 'tto',
  projectName: 'vanilla-docusaurus',
  githubHost: 'github.optum.com',
  ...
}
```
so that they reflect your repository!

Or update `package.json` with your username and run 
```bash
yarn deploy
```

Using Forge Since 28 June 2022

