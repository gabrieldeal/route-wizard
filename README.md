# route-wizard

Tools for planning trips to the mountains

http://yellowleaf.org/route-wizard/

# Todo

* Throttle requests to Open Elevation.
  * https://github.com/Jorl17/open-elevation/issues/3
  * https://www.npmjs.com/package/promise-throttle
  * https://www.npmjs.com/package/p-limit
* Accept GPX files.
* Use the segment & marker descriptions.
* Compute elevation gain more accurately.  Currently it only computes the gain between points in a line, which only works well if there are a lot of points.
* Support folders.
* Non-hacky sorting of segments. https://stackoverflow.com/questions/49883480/combine-a-sequence-of-linestring
* Export GeoJSON file with renamed segments for ordering in Caltopo?
* Get tooltip working for load route button.  https://stackoverflow.com/questions/50107641/material-ui-tooltip-on-select-menuitem-component-stays-displayed-after-selecti
