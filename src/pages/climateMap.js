import 'leaflet/dist/leaflet.css';
import * as Formatters from '../lib/formatters';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CircularProgress from '@material-ui/core/CircularProgress';
import compose from 'recompose/compose';
import convertToGeoJson from '../lib/convertToGeoJson';
import dayjs from '../lib/climate/dayjs';
import DayjsUtils from '@date-io/dayjs';
import DaymetCitation from '../components/daymetCitation';
import daymetClient from '../lib/climate/daymetClient';
import debounce from 'lodash/debounce';
import Drawer from '@material-ui/core/Drawer';
import ExpandLess from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';
import Layout from '../components/layout';
import Leaflet from 'leaflet';
import Marker from '../components/leaflet/Marker';
import PropTypes from 'prop-types';
import React from 'react';
import ReadFileButton from '../components/readFileButton';
import withCss from '../components/withCss';
import { GeoJSON, Map, Popup, TileLayer } from 'react-leaflet';
import { InlineDatePicker } from 'material-ui-pickers';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { preadFile } from '../lib/readFile';
import { withStyles } from '@material-ui/core/styles';

if (typeof window !== 'undefined') {
  Leaflet.Icon.Default.imagePath =
    '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/';
}

const styles = (theme) => ({
  settingsButton: {
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
    border: '2px solid rgba(0, 0, 0, 0.5)',
    backgroundColor: 'white',
    left: 2,
    top: 150,
    position: 'absolute',
    transform: 'rotate(90deg)',
    zIndex: 500,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  datePickerContainer: {
    width: 250,
    margin: 0,
    padding: '1em',
    zIndex: 501,
  },
  datePickerForm: {
    display: 'inline',
    marginBottom: 0,
  },
  drawerHeader: {
    float: 'right',
  },
  progressSpinner: {
    marginBottom: 'auto',
    marginRight: '1em',
    marginTop: 'auto',
  },
  readFileButtonContainer: {
    display: 'inline-block',
    verticalAlign: 'bottom',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

const DEBOUNCE_MS = 500;

class MapPage extends React.Component {
  constructor() {
    super();

    const today = dayjs().format('YYYY-MM-DD');

    this.state = {
      defaultDate: today,
      date: today,
      dimensions: {
        height: 0,
        width: 0,
      },
      drawerOpen: true,
      climateData: null,
      isLoading: false,
    };
  }

  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  toggleDrawer = (drawerOpen) => () => {
    this.setState({
      drawerOpen,
    });
  };

  updateDimensionsImmediately = () => {
    var viewportHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    const navbarHeight = document.getElementById('navbar').clientHeight;
    const dimensions = {
      width: '100%',
      height: viewportHeight - navbarHeight,
    };

    this.setState({ dimensions });
  };
  updateDimensions = debounce(this.updateDimensionsImmediately, DEBOUNCE_MS);

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
    window.addEventListener('visibilitychange', this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
    window.removeEventListener('visibilitychange', this.updateDimensions);
  }

  setOuterContainerDiv = (domElement) => (this.outerContainer = domElement);

  // FIXME: Share this?
  msg(data, progressMessage) {
    this.setState({ progressMessage: progressMessage + '...' });

    return new Promise((resolve) => {
      // Pause a bit after setting the progress message to give us a chance to render.
      const timeoutCallback = () => resolve(data);
      const timeoutMs = 500;
      setTimeout(timeoutCallback, timeoutMs);
    });
  }

  updateClimateDataImmediately = (query) => {
    daymetClient({ queries: [query] }).then((data) =>
      this.setState({ climateData: { ...data[0] } })
    );
  };
  updateClimateData = debounce(this.updateClimateDataImmediately, DEBOUNCE_MS);

  handleDatePickerChange = (date) => {
    this.setState({ date, climateData: null });

    if (date && this.state.position) {
      this.updateClimateData({ date, ...this.state.position });
    }
  };

  handleMapClick = (event) => {
    if (!this.state.date) {
      return; // FIXME: display a message
    }

    const lat = event.latlng.lat;
    const lon = event.latlng.lng; // FIXME: rename 'lon' to 'lng' in all my code?
    const position = { lat, lon };
    this.setState({ climateData: null, position });

    this.updateClimateData({ date: this.state.date, ...position });
  };

  handleError(errorMessage) {
    this.setState({ errorMessage, isLoading: false });
  }

  handleSelectedFile = (event) => {
    const file = event.target.files[0];
    const fileName = file.name;

    this.setState({ geoJson: null, isLoading: true });

    this.msg(file, 'Reading file')
      .then((file) => preadFile({ file }))
      .then((fileContentsStr) => this.msg(fileContentsStr, 'Parsing file'))
      .then((fileContentsStr) => {
        const geoJson = convertToGeoJson({ fileContentsStr, fileName });
        this.setState({ geoJson, isLoading: false, progressMessage: null });
      })
      .catch((error) => this.handleError(error));
  };

  renderOpenDrawerButton() {
    return (
      <IconButton
        size="large"
        className={this.props.classes.settingsButton}
        color="primary"
        onClick={this.toggleDrawer(true)}
        variant="outlined"
      >
        <ExpandLess />
      </IconButton>
    );
  }

  renderDrawer() {
    return (
      <Drawer
        ModalProps={{ keepMounted: true }}
        open={this.state.drawerOpen}
        onClose={this.toggleDrawer(false)}
      >
        <div tabIndex={0}>
          <div className={this.props.classes.drawerHeader}>
            <IconButton onClick={this.toggleDrawer(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          {this.renderDatePicker()}
        </div>
      </Drawer>
    );
  }

  renderDatePicker() {
    return (
      <div
        id="datePickerContainer"
        className={this.props.classes.datePickerContainer}
      >
        <h3>Instructions</h3>
        <p>
          Choose a time of year below. Then click the map to get historic
          climate statistics for that location. The statistics will be for the
          20-day time period centered on the selected day & month.
        </p>
        <h3>Settings</h3>
        <div className={this.props.classes.datePickerForm}>
          <InlineDatePicker
            keyboard
            clearable
            color="primary"
            variant="outlined"
            label="Time of year"
            value={this.state.date}
            onChange={this.handleDatePickerChange}
            format="MM-DD"
            mask={[/[01]/, /\d/, '/', /[0123]/, /\d/]}
          />
        </div>
        {this.renderReadRouteFileButton()}
      </div>
    );
  }

  renderReadRouteFileButton() {
    return (
      <div className={this.props.classes.readFileButtonContainer}>
        <ReadFileButton
          className={this.props.classes.readFileButton}
          disabled={this.state.isLoading}
          errorMessage={this.state.errorMessage}
          isLoading={this.state.isLoading}
          notificationMessage={this.state.notificationMessage}
          onChange={this.handleSelectedFile}
          progressMessage={this.state.progressMessage}
          variant="outlined"
        >
          Display route file
        </ReadFileButton>
      </div>
    );
  }

  renderClimatePopupText() {
    if (!this.state.climateData) {
      return (
        <CircularProgress
          className={this.props.classes.progressSpinner}
          size={25}
          thickness={7}
        />
      );
    }

    const { date, elevation, ...data } = this.state.climateData;
    let content = Object.entries(Formatters.typeMappings).map(
      ([key, [name, formatter]], index) => {
        const value = data[key];
        if (typeof value === 'undefined') {
          return null;
        }

        return (
          <li key={index}>
            {name}: {formatter(value)}
          </li>
        );
      }
    );
    if (content.length === 0) {
      return 'No data available';
    }

    const elevationFormatter = Formatters.typeMappings['elevation'][1];

    return (
      <div>
        <p>
          Climate summary for {date.format('MMM D')} at{' '}
          {elevationFormatter(elevation)} feet elevation:
        </p>
        <ul>{content}</ul>
        <DaymetCitation />
      </div>
    );
  }

  renderClimatePopup() {
    if (!this.state.position || !this.state.date) {
      return null;
    }

    const { lat, lon } = this.state.position;
    const position = [lat, lon];

    return (
      <Marker key={`${lat} ${lon}`} position={position}>
        <Popup>{this.renderClimatePopupText()}</Popup>
      </Marker>
    );
  }

  renderMap() {
    if (this.state.dimensions.height <= 0 || this.state.dimensions.width <= 0) {
      return <div />;
    }

    const mapConfig = {
      // Use https://www.npmjs.com/package/react-geolocated to get the location?
      center: [47.5, -100.0],
      zoom: 4,
    };
    const attribution =
      'Map data: &copy; ' +
      '<a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors,' +
      ' <a href="http://viewfinderpanoramas.org">SRTM</a>' +
      ' | Map style: &copy; ' +
      '<a href="https://opentopomap.org">OpenTopoMap</a>' +
      ' (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    return (
      <div className={this.props.classes.content} style={this.state.dimensions}>
        <Map
          center={mapConfig.center}
          onClick={this.handleMapClick}
          zoom={mapConfig.zoom}
          style={this.state.dimensions}
        >
          <TileLayer
            url="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution={attribution}
          />
          {this.renderClimatePopup()}
          {this.state.geoJson && <GeoJSON data={this.state.geoJson} />}
        </Map>
      </div>
    );
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={DayjsUtils}>
        <Layout fullScreen>
          {this.renderOpenDrawerButton()}
          {this.renderDrawer()}
          {this.renderMap()}
        </Layout>
      </MuiPickersUtilsProvider>
    );
  }
}

const enhance = compose(
  withCss, // Keep this first.
  withStyles(styles)
);

export default enhance(MapPage);
