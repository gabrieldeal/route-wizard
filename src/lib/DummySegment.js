export default class Segment {
  constructor({ title, description }) {
    this.title = title;
    this._description = description;
    this.elevations = [];
  }

  users() {
    return null;
  }

  surface() {
    return null;
  }

  locomotion() {
    return null;
  }

  description() {
    return this._description;
  }

  distance() {
    return null;
  }

  gain() {
    return null;
  }

  loss() {
    return null;
  }
}
