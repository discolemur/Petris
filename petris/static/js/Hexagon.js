"use strict";

class HexagonProps {
  constructor() {
    this.text = null;
    this.fontSize = null;
    this.cellWidth = null;
    this.borderWidth = null;
    this.cellBGColor = null;
    this.cellColor = '#000000';
    this.blinkBGColor = null;
    this.borderColor = null;
    this.hoverColor = null;
    this.hoverBGColor = null;
    this.hoverBorderColor = null;
    this.left = null;
    this.top = null;
    this.onClick = null;
    this.flatTop = false; // Whether to rotate the hexagon to flat side up.
  }
}

class Hexagon extends Component {
  constructor(props) {
    super(props);
    this.HEX_ID = uuidv4();
    this.HEX_STYLE = this.HEX_STYLE.bind(this);
    this._getTopBottomUnits = this._getTopBottomUnits.bind(this);
    this.HEX_TOP_STYLE = this.HEX_TOP_STYLE.bind(this);
    this.HEX_BOTTOM_STYLE = this.HEX_BOTTOM_STYLE.bind(this);
    this.blinkUpdateTrigger = this.blinkUpdateTrigger.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.blinkOn = true;
    this.blinking = false;
    this.setState({ hover: false });
  }
  HEX_STYLE() {
    let height = 0.57735026 * this.style.cellWidth;
    let margin = 0.288675135 * this.style.cellWidth;
    let bgcolor = (this.state.hover && this.style.hoverBGColor !== null) ? this.style.hoverBGColor : this.style.cellBGColor;
    let color = (this.state.hover && this.style.hoverColor !== null) ? this.style.hoverColor : this.style.cellColor;
    if (this.style.blinkBGColor !== null && this.blinkOn) {
      bgcolor = this.style.blinkBGColor;
    }
    let bColor = (this.state.hover && this.style.hoverBorderColor !== null) ? this.style.hoverBorderColor : this.style.borderColor;
    return {
      backgroundColor: bgcolor,
      color: color,
      height: `${height}px`,
      marginTop: `${margin}px`,
      marginBottom: `${margin}px`,
      width: this.style.cellWidth,
      marginLeft: 'auto',
      marginRight: 'auto',
      borderLeft: `solid ${this.style.borderWidth}px ${bColor}`,
      borderRight: `solid ${this.style.borderWidth}px ${bColor}`,
    }
  }
  _getTopBottomUnits() {
    let offset = this.style.cellWidth * 0.35355339059;
    let boxSide = this.style.cellWidth * 0.7071067812;
    let left = boxSide * 0.2; // Account for width. This was roughly approximated.
    left -= this.style.borderWidth * 0.8; // Account for border width. This was roughly approximated.
    return { offset: offset, boxSide: boxSide, left: left };
  }
  HEX_TOP_STYLE() {
    let basicUnits = this._getTopBottomUnits();
    let bColor = (this.state.hover && this.style.hoverBorderColor !== null) ? this.style.hoverBorderColor : this.style.borderColor;
    return {
      left: `${basicUnits.left}px`,
      width: `${basicUnits.boxSide}px`,
      height: `${basicUnits.boxSide}px`,
      top: `-${basicUnits.offset}px`,
      borderTop: `solid ${this.style.borderWidth * 1.414214}px ${bColor}`,
      borderRight: `solid ${this.style.borderWidth * 1.414214}px ${bColor}`
    }
  }
  HEX_BOTTOM_STYLE() {
    let basicUnits = this._getTopBottomUnits();
    let bColor = (this.state.hover && this.style.hoverBorderColor !== null) ? this.style.hoverBorderColor : this.style.borderColor;
    return {
      left: `${basicUnits.left}px`,
      width: `${basicUnits.boxSide}px`,
      height: `${basicUnits.boxSide}px`,
      bottom: `-${basicUnits.offset}px`,
      borderBottom: `solid ${this.style.borderWidth * 1.414214}px ${bColor}`,
      borderLeft: `solid ${this.style.borderWidth * 1.414214}px ${bColor}`
    }
  }
  componentDidMount() {
    document.addEventListener('mouseenter', this.onMouseEnter, true);
    document.addEventListener('mouseleave', this.onMouseLeave, true);
  }
  componentWillUnmount() {
    document.removeEventListener('mouseenter', this.onMouseEnter, true);
    document.removeEventListener('mouseleave', this.onMouseLeave, true);
  }
  blinkUpdateTrigger() {
    this.blinking = true;
    setTimeout(() => {
      if (this.blinking) {
        this.blinkUpdateTrigger();
      }
    }, this.blinkOn ? 300 : 700);
    this.blinkOn = !this.blinkOn;
    this.setState({});
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
  render(props, state) {
    this.style = props.styleParams;
    if (this.style.blinkBGColor !== null && !this.blinking) {
      this.blinking = true;
      this.blinkUpdateTrigger();
    }
    if (!this.style.blinkBGColor) {
      this.blinking = false;
    }
    let left = this.style.left * this.style.cellWidth;
    let top = this.style.top * this.style.cellWidth;
    let classes = this.style.flatTop ? 'hexCell rotateHex' : 'hexCell';
    let positionStyle = {};
    if (this.style.position) {
      positionStyle.position = this.style.position;
    }
    if (this.style.left) {
      positionStyle.left = left;
    }
    if (this.style.top) {
      positionStyle.top = top;
    }
    let fontSize = this.style.fontSize ? `${this.style.fontSize}px` : `${this.style.cellWidth / 6}px`;
    return h('div', { class: classes, style: positionStyle },
      h('div', { id: this.HEX_ID, class: 'hexagon', style: this.HEX_STYLE(), onClick: this.style.onClick },
        h('div', { class: "hexTop", style: this.HEX_TOP_STYLE() }),
        h('div', { class: "hexBottom", style: this.HEX_BOTTOM_STYLE() }),
        h('span', { style: { fontSize: fontSize } }, this.style.text)
      )
    )
  }
}

var defaultButton = (text, onClick, enabled) => {
  let props = new HexagonProps();
  props.text = text;
  props.cellWidth = 200;
  props.borderWidth = 5;
  if (enabled) {
    props.borderColor = '#718EA4';
    props.cellBGColor = '#496D89';
    props.hoverColor = '#123652';
    props.hoverBGColor = 'white';
    props.onClick = onClick;
  } else {
    props.borderColor = '#101010';
    props.cellBGColor = '#4C4C4C';
    props.onClick = () => { };
  }
  props.cellColor = '#FFFFFF'
  props.position = 'relative';
  return h(Hexagon, { styleParams: props });
}
