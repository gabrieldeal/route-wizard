// This is lifted from https://github.com/mui-org/material-ui/tree/master/examples/gatsby

import CssBaseline from '@material-ui/core/CssBaseline';
import JssProvider from 'react-jss/lib/JssProvider';
import React from 'react';
import {
  createMuiTheme,
  createGenerateClassName,
} from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { SheetsRegistry } from 'jss';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#36665E',
    },
  },
});

function createPageContext() {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
    // The standard class name generator.
    generateClassName: createGenerateClassName(),
  };
}

export function getPageContext() {
  // Make sure to create a new context for every server-side request so that data
  // isn't shared between connections (which would be bad).
  if (!process.browser) {
    return createPageContext();
  }

  // Reuse context on the client-side.
  if (!global.__INIT_MATERIAL_UI__) {
    global.__INIT_MATERIAL_UI__ = createPageContext();
  }

  return global.__INIT_MATERIAL_UI__;
}

function withCss(Component) {
  class WithRoot extends React.Component {
    muiPageContext = null;

    constructor(props) {
      super(props);
      this.muiPageContext = getPageContext();
    }

    componentDidMount() {
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector('#server-side-jss');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      return (
        <JssProvider generateClassName={this.muiPageContext.generateClassName}>
          {/* MuiThemeProvider makes the theme available down the React
              tree thanks to React context. */}
          <MuiThemeProvider
            theme={this.muiPageContext.theme}
            sheetsManager={this.muiPageContext.sheetsManager}
          >
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...this.props} />
          </MuiThemeProvider>
        </JssProvider>
      );
    }
  }

  return WithRoot;
}

export default withCss;
