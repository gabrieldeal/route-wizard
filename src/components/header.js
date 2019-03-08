import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  colorPrimary: {
    backgroundColor: '#DFF2FD',
    color: 'black',
  },
  siteIcon: {
    width: 30,
    height: 30,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: '1em',
  },
};

class Header extends React.Component {
  state = {
    anchorEl: null,
  };

  static propTypes = {
    classes: PropTypes.object.isRequired,
    siteTitle: PropTypes.string.isRequired,
  };

  render() {
    const { classes, siteTitle } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" className={classes.colorPrimary}>
          <Toolbar>
            <img
              alt="A yellow leaf"
              className={classes.siteIcon}
              src="public/ms-icon-144x144.png"
            />

            <Typography
              variant="title"
              color="inherit"
              className={classes.flex}
            >
              {siteTitle}
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

const enhance = withStyles(styles);

export default enhance(Header);
