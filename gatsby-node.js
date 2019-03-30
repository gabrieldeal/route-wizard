/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

exports.createPages = ({ actions }) => {
  const { createRedirect } = actions;

  createRedirect({
    fromPath: '/climate',
    isPermanent: true,
    redirectInBrowser: true,
    toPath: '/climateSpreadsheet',
  });

  createRedirect({
    fromPath: '/map',
    isPermanent: true,
    redirectInBrowser: true,
    toPath: '/climateMap',
  });
};

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /togpx|leaflet/,
            use: loaders.null(),
          },
        ],
      },
    });
  }
};
