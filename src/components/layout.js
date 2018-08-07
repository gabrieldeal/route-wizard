import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { StaticQuery, graphql } from 'gatsby';

import Header from './header';
import './layout.css';

const Layout = ({ children, data, pageTitle, whatIsThis }) => {
  const title = pageTitle && (
    <Tooltip title={whatIsThis}>
      <div style={{ paddingBottom: 10 }}>
        <Typography variant="title" style={{ display: 'inline' }}>
          {pageTitle}
        </Typography>
        <a style={{ diplay: 'inline', paddingLeft: 10 }} href="#">
          (What is this?)
        </a>
      </div>
    </Tooltip>
  );

  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={(data) => (
        <>
          <Helmet
            title={data.site.siteMetadata.title}
            meta={[
              {
                name: 'description',
                content: 'Build route spreadsheets from GeoJSON files',
              },
              {
                name: 'keywords',
                content: 'geojson, track, mountain, hike, long-distance',
              },
            ]}
          />
          <Header siteTitle={data.site.siteMetadata.title} />
          <div
            style={{
              margin: '0 auto',
              padding: '1rem 1.0875rem 1.45rem',
            }}
          >
            {title}
            {children}
          </div>
        </>
      )}
    />
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  pageTitle: PropTypes.string,
  whatIsThis: PropTypes.element,
};

export default Layout;
