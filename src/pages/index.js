import Link from 'gatsby-link';
import React from 'react';

import Layout from '../components/layout';

const IndexPage = () => {
  return (
    <Layout>
      <ul>
        <li>
          <Link to="/spreadsheet">Spreadsheet Generator</Link> - generate a
          spreadsheet from a GeoJSON file.
        </li>
        <li>
          <Link to="caltopo-sorter">Caltopo Sorter</Link> - hack to get segments
          to sort right in caltopo.com
        </li>
        <li>
          <Link to="elevation-augmenter">Elevation augmenter</Link> - Add
          elevation data to GeoJSON files.
        </li>
      </ul>
    </Layout>
  );
};

export default IndexPage;
