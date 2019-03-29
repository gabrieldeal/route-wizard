import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import React from 'react';
import ReadFileButton from './button';
import Status from './status';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  readFileContainer: {
    display: 'flex',
  },
});

function ReadFileButtonWithStatus(props) {
  const statusProps = [
    'isLoading',
    'errorMessage',
    'notificationMessage',
    'progressMessage',
  ];
  const buttonProps = [
    'isLoading',
    'children',
    'disabled',
    'onChange',
    'variant',
  ];

  return (
    <div className={props.classes.readFileContainer}>
      <ReadFileButton {...pick(props, buttonProps)} />
      <Status {...pick(props, statusProps)} />
    </div>
  );
}

ReadFileButtonWithStatus.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  notificationMessage: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  progressMessage: PropTypes.string,
};

const enhance = withStyles(styles);

export default enhance(ReadFileButtonWithStatus);
