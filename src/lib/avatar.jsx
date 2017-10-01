import React from 'react'
import PropTypes from 'prop-types'
import Konva from 'konva/src/Core'
import 'konva/src/shapes/Image'
import 'konva/src/shapes/Circle'
import 'konva/src/shapes/Rect'
import 'konva/src/shapes/Path'
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
    this.state = {
      image: image,
      imgWidth: 0,
      imgHeight: 0,
      scale: 1,
    }
  }

  componentDidMount() {
    if (this.image.complete) return this.init()
    this.image.onload = () => this.init()
  }

  get minCropRadius() {
    return this.props.minCropRadius
  }

  get scale() {
    return this.state.scale
  }

  get width() {
    return this.state.imgWidth
  }

  get height() {
    return this.state.imgHeight
  }

  get image () {
    return this.state.image
  }

  init() {
    const originalWidth = this.image.width
    const originalHeight = this.image.height

    const scale =  this.props.height / originalHeight
    const ration = originalHeight / originalWidth
    const imageWidth = this.props.height / ration

    this.setState({
      imgWidth: imageWidth,
      imgHeight: this.props.height,
      scale
    }, this.initCanvas)
  }

  initCanvas() {
    const stage = this.initStage()
    const background = this.initBackground()
    const shading = this.initShading()
    const crop = this.initCrop()
    const resize = this.initResize()
    const resizeIcon = this.initResizeIcon()

    const layer = new Konva.Layer();

    layer.add(background)
    layer.add(shading)
    layer.add(crop)
    layer.add(resize)
    layer.add(resizeIcon)

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
      resize.x(x + (crop.radius() * Math.sin(45)) - 6)
      resize.y(y - (crop.radius() * Math.cos(45)) - 6)
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
      radius: this.props.cropRadius,
      fillPatternImage: this.image,
      fillPatternOffset: { x : (this.width / 2) / this.scale, y : (this.height / 2) / this.scale },
      fillPatternScale: {
        x: this.scale,
        y: this.scale
      },
      stroke: 'white',
      strokeWidth: 2,
      opacity: 1,
      draggable: true,
      dashEnabled: true,
      dash: [10, 5]
    })
  }

  initResize() {
    return new Konva.Rect({
      x: this.width / 2 + (this.props.cropRadius * Math.sin(90)) - 6,
      y: this.height / 2 + (this.props.cropRadius * Math.cos(90)) - 6,
      width: 12,
      height: 12,
      fill: 'grey',
      stroke: 'white',
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

  initResizeIcon() {
    return new Konva.Path({
      x: 50,
      y: 40,
      data: 'M180.156,225.828c-1.903-1.902-4.093-2.854-6.567-2.854c-2.475,0-4.665,0.951-6.567,2.854l-94.787,94.787l-41.112-41.117    c-3.617-3.61-7.895-5.421-12.847-5.421c-4.952,0-9.235,1.811-12.851,5.421c-3.617,3.621-5.424,7.905-5.424,12.854v127.907    c0,4.948,1.807,9.229,5.424,12.847c3.619,3.613,7.902,5.424,12.851,5.424h127.906c4.949,0,9.23-1.811,12.847-5.424    c3.615-3.617,5.424-7.898,5.424-12.847s-1.809-9.233-5.424-12.854l-41.112-41.104l94.787-94.793    c1.902-1.903,2.853-4.086,2.853-6.564c0-2.478-0.953-4.66-2.853-6.57L180.156,225.828z',
      fill: '#FFFFFF',
      scale: {
        x : 0.04,
        y : 0.04
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