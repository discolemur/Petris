"use strict";

var HexagonProps = () => {
  return {
    text: null,
    fontSize: null,
    cellWidth: null,
    borderWidth: null,
    cellBGColor: null,
    cellColor: '#000000',
    borderColor: null,
    hoverColor: null,
    hoverBGColor: null,
    left: null,
    top: null,
    onClick: null,
    flatTop: false // Whether to rotate the hexagon to flat side up.
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
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.setState({ hover: false });
  }
  HEX_STYLE() {
    let height = 0.57735026 * this.style.cellWidth;
    let margin = 0.288675135 * this.style.cellWidth;
    let bgcolor = (this.state.hover && this.style.hoverBGColor !== null) ? this.style.hoverBGColor : this.style.cellBGColor;
    let color = (this.state.hover && this.style.hoverColor !== null) ? this.style.hoverColor : this.style.cellColor;
    return {
      backgroundColor: bgcolor,
      color: color,
      height: `${height}px`,
      marginTop: `${margin}px`,
      marginBottom: `${margin}px`,
      width: this.style.cellWidth,
      marginLeft: 'auto',
      marginRight: 'auto',
      borderLeft: `solid ${this.style.borderWidth}px ${this.style.borderColor}`,
      borderRight: `solid ${this.style.borderWidth}px ${this.style.borderColor}`,
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
    return {
      left: `${basicUnits.left}px`,
      width: `${basicUnits.boxSide}px`,
      height: `${basicUnits.boxSide}px`,
      top: `-${basicUnits.offset}px`,
      borderTop: `solid ${this.style.borderWidth * 1.414214}px ${this.style.borderColor}`,
      borderRight: `solid ${this.style.borderWidth * 1.414214}px ${this.style.borderColor}`
    }
  }
  HEX_BOTTOM_STYLE() {
    let basicUnits = this._getTopBottomUnits();
    return {
      left: `${basicUnits.left}px`,
      width: `${basicUnits.boxSide}px`,
      height: `${basicUnits.boxSide}px`,
      bottom: `-${basicUnits.offset}px`,
      borderBottom: `solid ${this.style.borderWidth * 1.414214}px ${this.style.borderColor}`,
      borderLeft: `solid ${this.style.borderWidth * 1.414214}px ${this.style.borderColor}`
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

var defaultButton = (text, onClick) => {
  let props = HexagonProps();
  props.text = text;
  props.onClick = onClick;
  props.cellWidth = 200;
  props.borderWidth = 5;
  props.cellBGColor = '#496D89';
  props.borderColor = '#718EA4';
  props.hoverColor = '#123652';
  props.hoverBGColor = 'white';
  props.position = 'relative';
  console.log(props);
  return h(Hexagon, { styleParams: props });
}
