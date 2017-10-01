import React from 'react'
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
    minCropRadius: 30
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

  get shadingColor() {
    return this.props.shadingColor
  }

  get shadingOpacity() {
    return this.props.shadingOpacity
  }

  get cropRadius() {
    return this.props.cropRadius
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

  get halfWidth() {
    return this.state.imgWidth / 2
  }

  get height() {
    return this.state.imgHeight
  }

  get halfHeight() {
    return this.state.imgHeight / 2
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
    const calcResizerX = x => x + (crop.radius() * 0.85)
    const calcResizerY = y => y - (crop.radius() * 0.5)
    const moveResizer = (x, y) => {
      resize.x(calcResizerX(x) - 8)
      resize.y(calcResizerY(y) - 8)
      resizeIcon.x(calcResizerX(x) - 8)
      resizeIcon.y(calcResizerY(y) - 10)
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
      fill: this.shadingColor,
      strokeWidth: 4,
      opacity: this.shadingOpacity
    })
  }

  initCrop() {
    return new Konva.Circle({
      x: this.halfWidth,
      y: this.halfHeight,
      radius: this.cropRadius,
      fillPatternImage: this.image,
      fillPatternOffset: {
        x : this.halfWidth / this.scale,
        y : this.halfHeight / this.scale
      },
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
      x: this.halfWidth + this.cropRadius * 0.85 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 8,
      width: 16,
      height: 16,
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
      x: this.halfWidth + this.cropRadius * 0.85 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 10,
      data: 'M47.624,0.124l12.021,9.73L44.5,24.5l10,10l14.661-15.161l9.963,12.285v-31.5H47.624z M24.5,44.5   L9.847,59.653L0,47.5V79h31.5l-12.153-9.847L34.5,54.5L24.5,44.5z',
      fill: '#FFFFFF',
      scale: {
        x : 0.2,
        y : 0.2
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