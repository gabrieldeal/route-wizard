import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { push } from 'gatsby-link';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  menuIcon: {
    color: 'white',
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

  handleMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (page) => {
    push(page);
    this.setState({ anchorEl: null });
  };

  handleSpreadsheetMenuItemClick = () => {
    this.handleMenuItemClick('/spreadsheet');
  };

  handleSorterMenuItemClick = () => {
    this.handleMenuItemClick('/caltopo-sorter');
  };

  render() {
    const { classes, siteTitle } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              aria-owns={this.state.anchorEl ? 'simple-menu' : null}
              aria-haspopup="true"
              onClick={this.handleMenuClick}
            >
              <MenuIcon className={classes.menuIcon} />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorEl}
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.handleSpreadsheetMenuItemClick}>
                Spreadsheet Generator
              </MenuItem>
              <MenuItem onClick={this.handleSorterMenuItemClick}>
                Caltopo Segment Sorter
              </MenuItem>
            </Menu>
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
