import React from 'react'
import PropTypes from 'prop-types'
import Konva from 'konva/src/Core'
import 'konva/src/shapes/Image'
import 'konva/src/shapes/Circle'
import 'konva/src/shapes/Rect'
import 'konva/src/Animation'
import 'konva/src/DragAndDrop'
// import 'tracking' //TODO Face detection
// import 'tracking/build/data/face'

class Avatar extends React.Component {

  static defaultProps = {
    shadingColor: 'grey',
    shadingOpacity: 0.6,
    cropRadius: 100,
    minCropRadius: 20
  }

  static propTypes = {
    img: PropTypes.any,
    src: PropTypes.string,
    scale: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
  }

  constructor(props) {
    super(props);
    const image = this.props.img || new Image()
    if (!this.props.img && this.props.src) image.src = this.props.src
    this.state = { image: image }
  }

  componentDidMount() {
    if (this.image.complete) {
      this.init()
    } else {
      this.image.onload = () => this.init()
    }
  }

  get minCropRadius() {
    return this.props.minCropRadius
  }

  get scale() {
    return this.props.scale || 1
  }

  get width() {
    return this.props.width * this.scale
  }

  get height() {
    return this.props.height * this.scale
  }

  get image () {
    return this.state.image
  }

  init() {
    const stage = this.initStage()
    const background = this.initBackground()
    const shading = this.initShading()
    const crop = this.initCrop()
    const resize = this.initResize()

    const layer = new Konva.Layer();

    layer.add(background)
    layer.add(shading)
    layer.add(crop)
    layer.add(resize)

    stage.add(layer)

    const scaledRadius = (scale = 0) => crop.radius()  - scale
    const isLeftCorner = scale => crop.x() - scaledRadius(scale) < 0
    const calcLeft = () => crop.radius() + 1
    const isTopCorner = scale => crop.y() - scaledRadius(scale) < 0
    const calcTop = () => crop.radius() + 1
    const isRightCorner = scale => crop.x() + scaledRadius(scale) > stage.width()
    const calcRight = () => stage.width() - crop.radius() - 1
    const isBottomCorner = scale => crop.y() + scaledRadius(scale) > stage.height()
    const calcBottom = () => stage.height() - crop.radius() - 1
    const isNotOutOfScale = scale => !isLeftCorner(scale) && !isRightCorner(scale) && !isBottomCorner(scale) && !isTopCorner(scale)
    const calcScaleRadius = scale => scaledRadius(scale) >= this.minCropRadius ? scale : crop.radius() - this.minCropRadius
    const moveResizer = (x, y) => {
      resize.x(x + (crop.radius() * Math.sin(45)) - 5)
      resize.y(y - (crop.radius() * Math.cos(45)) - 5)
    }

    crop.on("dragmove", () => crop.fire('resize'))

    crop.on('resize', () => {
      const x = isLeftCorner() ? calcLeft() : (isRightCorner() ? calcRight() : crop.x())
      const y = isTopCorner() ? calcTop() : (isBottomCorner() ? calcBottom() : crop.y())
      moveResizer(x, y)
      crop.setFillPatternOffset({ x: x / this.scale, y: y / this.scale })
      crop.x(x)
      crop.y(y)
    })

    crop.on("mouseenter", () => stage.container().style.cursor = 'move')
    crop.on("mouseleave", () => stage.container().style.cursor = 'default')
    crop.on('dragstart', () => stage.container().style.cursor = 'move')
    crop.on('dragend', () => stage.container().style.cursor = 'default')

    resize.on("dragmove", (evt) => {
      const scaleY = evt.evt.movementY
      const scale = scaleY  > 0 || isNotOutOfScale(scaleY) ? scaleY : 0
      crop.radius(crop.radius() - calcScaleRadius(scale))
      resize.fire('resize')
    })

    resize.on('resize', () => moveResizer(crop.x(), crop.y()))

    resize.on("mouseenter", () => stage.container().style.cursor = 'nesw-resize')
    resize.on("mouseleave", () => stage.container().style.cursor = 'default')
    resize.on('dragstart', () => stage.container().style.cursor = 'nesw-resize')
    resize.on('dragend', () => stage.container().style.cursor = 'default')
  }

  initStage() {
    return new Konva.Stage({
      container: 'avatarContainer',
      width: this.width,
      height: this.height
    })
  }

  initBackground() {
    return new Konva.Image({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      image: this.image
    })
  }

  initShading() {
    return new Konva.Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fill: this.props.shadingColor,
      strokeWidth: 4,
      opacity: this.props.shadingOpacity
    })
  }

  initCrop() {
    return new Konva.Circle({
      x: this.width / 2,
      y: this.height / 2,
      radius: this.props.cropRadius * this.scale,
      fillPatternImage: this.image,
      fillPatternOffset: { x : (this.width / 2) / this.scale, y : (this.height / 2) / this.scale },
      fillPatternScale: {
        x: this.scale,
        y: this.scale
      },
      stroke: 'black',
      strokeWidth: 1,
      opacity: 1,
      draggable: true
    })
  }

  initResize() {
    return new Konva.Rect({
      x: this.width / 2 + (this.props.cropRadius * this.scale * Math.sin(90)) - 5,
      y: this.height / 2 + (this.props.cropRadius * this.scale * Math.cos(90)) - 5,
      width: 10,
      height: 10,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1,
      draggable: true,
      dragBoundFunc: function(pos) {
        return {
          x: this.getAbsolutePosition().x,
          y: pos.y
        }
      }
    })
  }

  render() {
    return (
      <div id="avatarContainer"/>
    )
  }
}

export default Avatar