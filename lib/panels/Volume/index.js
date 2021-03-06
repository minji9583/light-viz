import React from 'react';
import PropTypes from 'prop-types';
import equals from 'mout/src/array/equals';
import PieceWiseFunctionEditorWidget from 'paraviewweb/src/React/Widgets/PieceWiseFunctionEditorWidget';

import AbstractPanel from '../AbstractPanel';
import { getColorMap, getState } from '../../client';

import {
  setOpacityPoints,
  getOpacityPoints,
  addOpacityMapObserver,
  removeOpacityMapObserver,
} from '../../widgets/ColorMap/OpacityMapSyncer';

export default class VolumePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentArray: 0,
      rangeMin: 0,
      rangeMax: 1,
      hideAdditionalControls: false,
      points: [
        { x: props.dataset.data.arrays[0].range[0], y: 0.0 },
        { x: props.dataset.data.arrays[0].range[1], y: 1.0 },
      ],
    };

    this.setOpacityPoints = this.setOpacityPoints.bind(this);
    this.opacityPointsUpdated = this.opacityPointsUpdated.bind(this);
    this.arrayRangeUpdated = this.arrayRangeUpdated.bind(this);
    this.updateActiveArray = this.updateActiveArray.bind(this);
    this.loadColorMapRange = this.loadColorMapRange.bind(this);
  }

  componentWillMount() {
    getColorMap(
      this.props.dataset.data.arrays[this.state.currentArray].name,
      this.loadColorMapRange
    );
  }

  componentDidMount() {
    getState('volume', this.modulePanel);
  }

  componentWillReceiveProps(newProps) {
    if (!equals(newProps.dataset.data.arrays, this.props.dataset.data.arrays)) {
      removeOpacityMapObserver(
        this.props.dataset.data.arrays[this.state.currentArray].name,
        this
      );
      const newState = { currentArray: this.state.currentArray };
      if (this.state.currentArray >= newProps.dataset.data.arrays.length) {
        newState.currentArray = 0;
      }
      addOpacityMapObserver(
        newProps.dataset.data.arrays[newState.currentArray].name,
        this
      );
      const min = newProps.dataset.data.arrays[newState.currentArray].range[0];
      const max = newProps.dataset.data.arrays[newState.currentArray].range[1];
      if (this.state.rangeMin < min || this.state.rangeMin > max) {
        newState.rangeMin = min;
      }
      if (this.state.rangeMax < min || this.state.rangeMax > max) {
        newState.rangeMax = max;
      }
      this.setState(newState);
    }
  }

  setOpacityPoints(points) {
    setOpacityPoints(
      this.props.dataset.data.arrays[this.state.currentArray].name,
      points
    );
  }

  opacityPointsUpdated(name, points) {
    this.setState({ points });
  }

  arrayRangeUpdated(name, range) {
    this.setState({ rangeMin: range[0], rangeMax: range[1] });
  }

  updateActiveArray(arrayName) {
    removeOpacityMapObserver(
      this.props.dataset.data.arrays[this.state.currentArray].name,
      this
    );
    let index = 0;
    this.props.dataset.data.arrays.forEach((array, idx) => {
      if (array.name === arrayName) {
        index = idx;
      }
    });
    const points = getOpacityPoints(arrayName);
    addOpacityMapObserver(arrayName, this);
    this.setState({ currentArray: index, points });
    getColorMap(arrayName, this.loadColorMapRange);
  }

  loadColorMapRange(preset, range) {
    this.setState({ rangeMin: range[0], rangeMax: range[1] });
  }

  render() {
    return (
      <AbstractPanel
        ref={(c) => {
          this.modulePanel = c;
        }}
        allowVolumeRepresentation
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        moduleName="Volume"
        onLookupTableChange={this.updateActiveArray}
        representationsToUse={[]}
        name="volume"
        noSolid
      >
        <PieceWiseFunctionEditorWidget
          rangeMin={this.state.rangeMin}
          rangeMax={this.state.rangeMax}
          points={this.state.points}
          onChange={this.setOpacityPoints}
          width={345}
          height={150}
        />
      </AbstractPanel>
    );
  }
}

VolumePanel.propTypes = {
  dataset: PropTypes.object,
  hideAdditionalControls: PropTypes.bool,
};

VolumePanel.defaultProps = {
  dataset: undefined,
  hideAdditionalControls: false,
};
