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
      </ul>
    </Layout>
  );
};

export default IndexPage;
