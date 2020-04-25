"use strict";

class HexagonProps {
  constructor() {
    this.text = null;
    this.fontSize = null;
    this.hexWidth = null;
    this.borderWidth = 0;
    this.BGClass = null;
    this.color = '#000000';
    this.blinkClass = null;
    this.borderColor = null;
    this.hoverColor = null;
    this.hoverBGClass = null;
    this.hoverBorderColor = null;
    this.left = null;
    this.top = null;
    this.onClick = null;
    this.flatTop = false; // Whether to rotate the hexagon to flat side up.
    this.transitionAll = false;
    this.spinning = false;
    this.position = null;
    this.rotateText = false;
  }
}

class Hexagon extends Component {
  constructor(props) {
    super(props);
    this.HEX_ID = uuidv4();
    this._borderColor = this._borderColor.bind(this);
    this._backgroundClass = this._backgroundClass.bind(this);
    this.HEX_STYLE = this.HEX_STYLE.bind(this);
    this._getTopBottomUnits = this._getTopBottomUnits.bind(this);
    this.HEX_TOP_STYLE = this.HEX_TOP_STYLE.bind(this);
    this.HEX_BOTTOM_STYLE = this.HEX_BOTTOM_STYLE.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
    this.setState({ hover: false });
  }
  /**
   * Hover gets priority over blink. If no hover or blink, this.style.borderColor.
   */
  _borderColor() {
    let bColor = this.style.borderColor;
    if (this.state.hover && this.style.hoverBorderColor !== null) {
      bColor = this.style.hoverBorderColor;
    }
    return bColor;
  }
  _backgroundClass() {
    let bgClass = this.style.BGClass;
    if (this.state.hover && this.style.hoverBGClass !== null) {
      bgClass = this.style.hoverBGClass;
    }
    return bgClass;
  }
  HEX_STYLE() {
    let height = 0.57735026 * this.style.hexWidth;
    let margin = 0.288675135 * this.style.hexWidth;
    let bColor = this._borderColor();
    let rv = {
      height: `${height}px`,
      marginTop: `${margin}px`,
      marginBottom: `${margin}px`,
      width: this.style.hexWidth,
      marginLeft: 'auto',
      marginRight: 'auto'

    };
    if (this.style.borderWidth !== null && this.style.borderWidth > 0) {
      rv.borderLeft = `solid ${this.style.borderWidth}px ${bColor}`;
      rv.borderRight = `solid ${this.style.borderWidth}px ${bColor}`;
    } else {
      rv.border = 'none';
    }
    return rv;
  }
  _getTopBottomUnits() {
    let offset = this.style.hexWidth * 0.35355339059;
    let boxSide = this.style.hexWidth * 0.7071067812;
    let left = boxSide * 0.2; // Account for width. This was roughly approximated.
    left -= this.style.borderWidth * 0.8; // Account for border width. This was roughly approximated.
    return { offset: offset, boxSide: boxSide, left: left };
  }
  HEX_TOP_STYLE() {
    let basicUnits = this._getTopBottomUnits();
    let bColor = this._borderColor();
    let rv = {
      left: `${basicUnits.left}px`,
      width: `${basicUnits.boxSide}px`,
      height: `${basicUnits.boxSide}px`,
      top: `-${basicUnits.offset}px`
    };
    if (this.style.borderWidth !== null && this.style.borderWidth > 0) {
      rv.borderTop = `solid ${this.style.borderWidth * 1.414214}px ${bColor}`;
      rv.borderRight = `solid ${this.style.borderWidth * 1.414214}px ${bColor}`;
    } else {
      rv.border = 'none';
    }
    return rv;
  }
  HEX_BOTTOM_STYLE() {
    let basicUnits = this._getTopBottomUnits();
    let bColor = this._borderColor();
    let rv = {
      left: `${basicUnits.left}px`,
      width: `${basicUnits.boxSide}px`,
      height: `${basicUnits.boxSide}px`,
      bottom: `-${basicUnits.offset}px`
    };
    if (this.style.borderWidth !== null && this.style.borderWidth > 0) {
      rv.borderBottom = `solid ${this.style.borderWidth * 1.414214}px ${bColor}`;
      rv.borderLeft = `solid ${this.style.borderWidth * 1.414214}px ${bColor}`;
    } else {
      rv.border = 'none';
    }
    return rv;
  }
  componentDidMount() {
    document.addEventListener('mouseenter', this.onMouseEnter, true);
    document.addEventListener('mouseleave', this.onMouseLeave, true);
  }
  componentWillUnmount() {
    document.removeEventListener('mouseenter', this.onMouseEnter, true);
    document.removeEventListener('mouseleave', this.onMouseLeave, true);
  }
  onMouseEnter(e) {
    if (e.target.id === this.HEX_ID) {
      this.setState({ hover: true });
    }
  }
  onMouseLeave(e) {
    if (e.target.id === this.HEX_ID) {
      this.setState({ hover: false });
    }
  }
  onClick(e) {
    if (this.style.onClick !== null) {
      e.stopPropagation();
      e.preventDefault();
      this.style.onClick();
    }
  }
  render(props, state) {
    this.style = props.styleParams;
    let left = this.style.left * this.style.hexWidth;
    let top = this.style.top * this.style.hexWidth;
    let classes = `hexagon ${this._backgroundClass()}`;
    if (this.style.flatTop) {
      classes = classes + ' rotateHex';
    }
    if (this.style.transitionAll) {
      classes = classes + ' transitionAll';
    }
    if (this.style.spinning) {
      classes = classes + ' spinner';
    }
    if (this.style.blinkClass !== null) {
      classes = classes + ` ${this.style.blinkClass}`;
    }
    let positionStyle = {
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center'
    };
    if (this.style.position) {
      positionStyle.position = this.style.position;
    }
    if (this.style.left) {
      positionStyle.left = left;
    }
    if (this.style.top) {
      positionStyle.top = top;
    }
    positionStyle.width = this.style.hexWidth + 8 * this.style.borderWidth;
    let fontSize = this.style.fontSize ? `${this.style.fontSize}px` : `${this.style.hexWidth / 6}px`;
    let color = (this.state.hover && this.style.hoverColor !== null) ? this.style.hoverColor : this.style.color;
    let textClasses = this.style.rotateText ? 'innerHexTextWrapper rotateText' : 'innerHexTextWrapper';
    return h('div', {
      style: {
        width: 'auto',
      }
    },
      h('div', { class: 'hexCell', style: positionStyle },
        h('div', { class: 'innerHexWrapper' },
          h('div', { id: this.HEX_ID, class: classes, style: this.HEX_STYLE(), onClick: this.onClick },
            h('div', { class: "hexTop", style: this.HEX_TOP_STYLE(), onClick: this.onClick }),
            h('div', { class: "hexBottom", style: this.HEX_BOTTOM_STYLE(), onClick: this.onClick }),
          ),
          h('div', { class: textClasses },
            h('span', { style: { fontSize: fontSize, color: color } }, this.style.text)
          )
        )
      )
    )
  }
}

function defaultButtonWidth(isRow, numToFit) {
  if (isRow) {
    return Math.min(200, window.innerWidth / (numToFit + 1));
  } else {
    return Math.min(200, window.innerHeight / (numToFit + 1));
  }
}

function defaultButtonProps(text, width, onClick, enabled) {
  if (width === null) {
    width = defaultButtonWidth();
  }
  let props = new HexagonProps();
  props.text = text;
  props.hexWidth = width;
  props.borderWidth = 5;
  if (enabled) {
    props.borderColor = '#718EA4';
    props.BGClass = ENABLED_BUTTON_CLASS;
    props.hoverColor = '#123652';
    props.hoverBGClass = WHITE_CLASS;
    props.onClick = onClick;
  } else {
    props.borderColor = '#101010';
    props.BGClass = DISABLED_BUTTON_CLASS;
    props.onClick = () => { };
  }
  props.color = '#FFFFFF'
  props.position = 'relative';
  return props;
}

var defaultButton = (text, width, onClick, enabled) => {
  return h(Hexagon, { styleParams: defaultButtonProps(text, width, onClick, enabled) });
}
