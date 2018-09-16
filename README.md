# route-wizard

* Sort the lines from a GeoJSON file created on http://caltopo.com
* Generate a data book spreadsheet based on the lines & markers from a GeoJSON file.  Example: https://www.yellowleaf.org/routes/greenway-databook/

# Demo

http://yellowleaf.org/route-wizard/

# Todo

* Add GPX->GeoJSON converter.
* Compute elevation gain more accurately.  Currently it only computes the gain between points in a line, which only works well if there are a lot of points.
* Support folders.
* Non-hacky sorting of segments. https://stackoverflow.com/questions/49883480/combine-a-sequence-of-linestring
* Clear errors after a successful load.
* Do not give an error when the user clicks cancel on the file dialog.
* Allow the same file to be uploaded twice in a row.

