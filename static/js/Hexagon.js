var HEX_STYLE = (width, borderWidth, cellColor, borderColor, hoverColor) => {
  let height = 0.57735026 * width;
  let margin = 0.288675135 * width;
  return {
    backgroundColor: cellColor,
    height: `${height}px`,
    marginTop: `${margin}px`,
    marginBottom: `${margin}px`,
    width: width,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderLeft: `solid ${borderWidth}px ${borderColor}`,
    borderRight: `solid ${borderWidth}px ${borderColor}`,
    hover: {
      backgroundColor: hoverColor // TODO fix this.
    }
  }
}

let _getTopBottomUnits = (width, borderWidth) => {
  let offset = width * 0.35355339059;
  let boxSide = width * 0.7071067812;
  let left = boxSide * 0.2; // Account for width. This was roughly approximated.
  left -= borderWidth * 0.8; // Account for border width. This was roughly approximated.
  return { offset: offset, boxSide: boxSide, left: left };
}

var HEX_TOP_STYLE = (width, borderWidth, borderColor) => {
  basicUnits = _getTopBottomUnits(width, borderWidth);
  return {
    left: `${basicUnits.left}px`,
    width: `${basicUnits.boxSide}px`,
    height: `${basicUnits.boxSide}px`,
    top: `-${basicUnits.offset}px`,
    borderTop: `solid ${borderWidth * 1.414214}px ${borderColor}`,
    borderRight: `solid ${borderWidth * 1.414214}px ${borderColor}`
  }
}

var HEX_BOTTOM_STYLE = (width, borderWidth, borderColor) => {
  basicUnits = _getTopBottomUnits(width, borderWidth);
  return {
    left: `${basicUnits.left}px`,
    width: `${basicUnits.boxSide}px`,
    height: `${basicUnits.boxSide}px`,
    bottom: `-${basicUnits.offset}px`,
    borderBottom: `solid ${borderWidth * 1.414214}px ${borderColor}`,
    borderLeft: `solid ${borderWidth * 1.414214}px ${borderColor}`
  }
}

// TODO: make this accept style as an object to add to style, instead of so many positional arguments.

var hexagon = (text, fontSize, width, borderWidth, cellColor, borderColor, hoverColor) => {
  // TODO set hoverColor everywhere
  return h('div', { class: "hexagon", style: HEX_STYLE(width, borderWidth, cellColor, borderColor, hoverColor) },
    h('div', { class: "hexTop", style: HEX_TOP_STYLE(width, borderWidth, borderColor) }),
    h('div', { class: "hexBottom", style: HEX_BOTTOM_STYLE(width, borderWidth, borderColor) }),
    h('span', { style: { fontSize: `${fontSize}px` } }, text)
  )
}

var hexagonButton = (text, width, borderWidth, cellColor, borderColor, hoverColor, onClick) => {
  // TODO set hoverColor everywhere
  return h('div', { class: "btn hexagon", style: HEX_STYLE(width, borderWidth, cellColor, borderColor, hoverColor), onClick: onClick },
    h('div', { class: "hexTop", style: HEX_TOP_STYLE(width, borderWidth, borderColor) }),
    h('div', { class: "hexBottom", style: HEX_BOTTOM_STYLE(width, borderWidth, borderColor) }),
    h('span', { style: { fontSize: `${width / 6}px` } }, text)
  )
}

var hexagonCell = (text, width, borderWidth, cellColor, borderColor, hoverColor, left, top, onClick) => {
  left *= width;
  top *= width;
  return h('div', { class: 'hexCell rotateHex', style: { left: left, top: top } },
    hexagonButton(text, width, borderWidth, cellColor, borderColor, onClick)
  )
}

