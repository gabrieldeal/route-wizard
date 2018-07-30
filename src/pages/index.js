import Button from '@material-ui/core/Button'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import Layout from '../components/layout'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
})

const IndexPage = props => {
  const { classes } = props

  return (
    <Layout>
      <input
        accept="image/*"
        className={classes.input}
        id="route-file"
        type="file"
      />
      <label htmlFor="route-file">
        <Button
          color="primary"
          variant="contained"
          component="span"
          className={classes.button}
        >
          Upload route
        </Button>
      </label>
    </Layout>
  )
}

const enhance = withStyles(styles)

export default enhance(IndexPage)
