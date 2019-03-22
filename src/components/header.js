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
  menuAnchorOrigin: {
    vertical: 'top',
    horizontal: 'right',
  },
  menuTransformOrigin: {
    vertical: 'top',
    horizontal: 'right',
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
              anchorOrigin={classes.menuAnchorOrigin}
              id="menu-appbar"
              onClose={this.handleClose}
              open={Boolean(this.state.anchorEl)}
              transformOrigin={classes.menuTransformOrigin}
            >
              <MenuItem onClick={this.handleGoToRoutePageClick}>
                Create databook from route
              </MenuItem>
              <MenuItem onClick={this.handleGoToClimatePageClick}>
                Add climate data to spreadsheet
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
