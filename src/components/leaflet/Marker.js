import React from 'react';
import { Marker } from 'react-leaflet';

const openPopup = (ref) => {
  if (ref) {
    ref.leafletElement.openPopup();
  }
};

export default function MarkerWithOpenedPopup(props) {
  return <Marker ref={openPopup} {...props} />;
}
