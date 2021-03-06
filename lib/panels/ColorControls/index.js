import React from 'react';
import PropTypes from 'prop-types';

import LinearPieceWiseEditor from 'paraviewweb/src/NativeUI/Canvas/LinearPieceWiseEditor';

import style from 'LightVizStyle/ColorControls.mcss';

import { colorMaps } from '../../widgets/ColorMap';
import { setColorMap, updateOpacityMap } from '../../client';

export default class ColorControlsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeColorMap: 0,
    };
    this.onEditorUpdated = this.onEditorUpdated.bind(this);
    this.updateColorMap = this.updateColorMap.bind(this);
  }

  componentDidMount() {
    const container = this.canvas;
    this.editor = new LinearPieceWiseEditor(container);

    this.editor.onChange(this.onEditorUpdated);

    this.editor.render();
  }

  onEditorUpdated(controlPoints, envelope) {
    updateOpacityMap(controlPoints);
  }

  updateColorMap(event) {
    let colorMap;
    let index;
    for (let i = 0; i < colorMaps.length; ++i) {
      if (colorMaps[i].label === event.target.alt) {
        colorMap = colorMaps[i];
        index = i;
      }
    }
    setColorMap(colorMap.name);
    this.setState({ activeColorMap: index });
  }

  render() {
    return (
      <div className={style.colorControls}>
        <div className={style.colorControlsHeader}>
          <span className={style.title}>Color Map</span>
        </div>
        <div className={style.controls}>
          {colorMaps.map((cmap, idx) => (
            <div className={style.line} key={idx}>
              <img
                className={style.image}
                src={cmap.icon}
                onClick={this.updateColorMap}
                alt={cmap.label}
              />
            </div>
          ))}
          <div className={style.popupDiv}>
            <canvas
              ref={(c) => {
                this.canvas = c;
              }}
              className={style.canvas}
            />
          </div>
        </div>
      </div>
    );
  }
}

ColorControlsPanel.propTypes = {
  dataset: PropTypes.object,
};

ColorControlsPanel.defaultProps = {
  dataset: undefined,
};
