import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { navigate } from 'gatsby';
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

const menuAnchorOrigin = {
  vertical: 'top',
  horizontal: 'right',
};
const menuTransformOrigin = {
  vertical: 'top',
  horizontal: 'right',
};

class Header extends React.Component {
  state = {
    anchorEl: null,
  };

  static propTypes = {
    classes: PropTypes.object.isRequired,
    siteTitle: PropTypes.string.isRequired,
  };

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleGoToRoutePageClick = () => {
    this.setState({ anchorEl: null });
    navigate('/');
  };

  handleGoToClimatePageClick = () => {
    this.setState({ anchorEl: null });
    navigate('/climate');
  };

  handleGoToMapClick = () => {
    this.setState({ anchorEl: null });
    navigate('/map');
  };

  render() {
    const { classes, siteTitle } = this.props;

    return (
      <div id="navbar" className={classes.root}>
        <AppBar position="static" className={classes.colorPrimary}>
          <Toolbar>
            <img
              alt="A yellow leaf"
              className={classes.siteIcon}
              src="/route-wizard/public/ms-icon-144x144.png"
            />

            <Typography
              variant="title"
              color="inherit"
              className={classes.flex}
            >
              {siteTitle}
            </Typography>

            <IconButton
              aria-label="Menu"
              className={classes.menuButton}
              color="inherit"
              onClick={this.handleMenu}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={this.state.anchorEl}
              anchorOrigin={menuAnchorOrigin}
              id="menu-appbar"
              onClose={this.handleClose}
              open={Boolean(this.state.anchorEl)}
              transformOrigin={menuTransformOrigin}
            >
              <MenuItem onClick={this.handleGoToRoutePageClick}>
                Create databook from route
              </MenuItem>
              <MenuItem onClick={this.handleGoToClimatePageClick}>
                Add climate data to spreadsheet
              </MenuItem>
              <MenuItem onClick={this.handleGoToMapClick}>
                Climate data map
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

const enhance = withStyles(styles);

export default enhance(Header);
