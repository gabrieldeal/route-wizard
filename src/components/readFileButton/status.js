import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  errorContainer: {
    color: 'red',
    fontWeight: 800,
    marginBottom: 'auto',
    marginLeft: '1em',
    marginTop: 'auto',
  },
  messagesContainer: {
    display: 'flex',
    marginBottom: 'auto',
    marginLeft: '1em',
    marginTop: 'auto',
  },
  notificationMessageContainer: {
    fontWeight: 800,
  },
  progressSpinner: {
    marginBottom: 'auto',
    marginRight: '1em',
    marginTop: 'auto',
  },
  textMessagesContainer: {
    display: 'block',
  },
});

function Status(props) {
  return (
    <div className={props.classes.messagesContainer}>
      {props.isLoading && (
        <CircularProgress
          className={props.classes.progressSpinner}
          size={25}
          thickness={7}
        />
      )}
      <div className={props.classes.textMessagesContainer}>
        <div className={props.classes.notificationMessageContainer}>
          {props.notificationMessage}
        </div>
        <div>{props.progressMessage}</div>
      </div>
      <div className={props.classes.errorContainer}>
        {props.errorMessage && `Error: ${props.errorMessage}`}
      </div>
    </div>
  );
}

Status.propTypes = {
  classes: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  notificationMessage: PropTypes.string,
  progressMessage: PropTypes.string,
};

const enhance = withStyles(styles);

export default enhance(Status);
