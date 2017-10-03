import React from 'react'
import Konva from 'konva/src/Core'
import 'konva/src/shapes/Image'
import 'konva/src/shapes/Circle'
import 'konva/src/shapes/Rect'
import 'konva/src/shapes/Path'
import 'konva/src/Animation'
import 'konva/src/DragAndDrop'
// import 'tracking' // TODO Face detection
// import 'tracking/build/data/face'

class Avatar extends React.Component {

  static defaultProps = {
    shadingColor: 'grey',
    shadingOpacity: 0.6,
    cropRadius: 100,
    minCropRadius: 30,
    backgroundColor: 'grey'
  }

  constructor(props) {
    super(props)
    const containerId = this.generateHash('avatar_container')
    const loaderId = this.generateHash('avatar_loader')
    this.onFileLoad = this.onFileLoad.bind(this)
    this.state = {
      imgWidth: 0,
      imgHeight: 0,
      scale: 1,
      containerId,
      loaderId,
      showLoader: !(this.props.src || this.props.img)
    }
  }

  generateHash(prefix) {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    return prefix + '-' + s4() + '-' + s4() + '-' + s4()
  }

  onCrop(img) {
    if (!this.props.onCrop && typeof this.props.onCrop !== 'function') return
    this.props.onCrop(img)
  }

  componentDidMount() {
    if (this.state.showLoader) return

    const image = this.props.img || new Image()
    if (!this.props.img && this.props.src) image.src = this.props.src
    this.setState({ image }, () => {
      if (this.image.complete) return this.init()
      this.image.onload = () => this.init()
    })
  }

  get containerId() {
    return this.state.containerId
  }

  get loaderId() {
    return this.state.loaderId
  }

  get backgroundColor() {
    return this.props.backgroundColor
  }

  get shadingColor() {
    return this.props.shadingColor
  }

  get shadingOpacity() {
    return this.props.shadingOpacity
  }

  get cropRadius() {
    return this.state.cropRadius
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

  get image() {
    return this.state.image
  }

  onFileLoad(e) {
    e.preventDefault()

    let reader = new FileReader()
    let file = e.target.files[0]

    const image = new Image()
    const ref = this
    reader.onloadend = () => {
      image.src = reader.result

      ref.setState({ image, file, showLoader: false }, () => {
        if (ref.image.complete) return ref.init()
        ref.image.onload = () => ref.init()
      })
    }
    reader.readAsDataURL(file)
  }

  init() {
    const originalWidth = this.image.width
    const originalHeight = this.image.height
    const ration = originalHeight / originalWidth
    const height = this.props.height || originalHeight

    const scale =  height / originalHeight
    const imageWidth = height / ration
    const cropRadius = imageWidth / 4

    this.setState({
      imgWidth: imageWidth,
      imgHeight: height,
      scale,
      cropRadius
    }, this.initCanvas)
  }

  initCanvas() {
    const stage = this.initStage()
    const background = this.initBackground()
    const shading = this.initShading()
    const crop = this.initCrop()
    const cropStroke = this.initCropStroke()
    const resize = this.initResize()
    const resizeIcon = this.initResizeIcon()

    const layer = new Konva.Layer()

    layer.add(background)
    layer.add(shading)
    layer.add(cropStroke)
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
    const calcResizerX = x => x + (crop.radius() * 0.86)
    const calcResizerY = y => y - (crop.radius() * 0.5)
    const moveResizer = (x, y) => {
      resize.x(calcResizerX(x) - 8)
      resize.y(calcResizerY(y) - 8)
      resizeIcon.x(calcResizerX(x) - 8)
      resizeIcon.y(calcResizerY(y) - 10)
    }
    const getPreview = () => crop.toDataURL({
      x: crop.x() - crop.radius(),
      y: crop.y() - crop.radius(),
      width: crop.radius() * 2,
      height: crop.radius() * 2
    })

    this.onCrop(getPreview())

    crop.on("dragmove", () => crop.fire('resize'))
    crop.on("dragend", () => this.onCrop(getPreview()))

    crop.on('resize', () => {
      const x = isLeftCorner() ? calcLeft() : (isRightCorner() ? calcRight() : crop.x())
      const y = isTopCorner() ? calcTop() : (isBottomCorner() ? calcBottom() : crop.y())
      moveResizer(x, y)
      crop.setFillPatternOffset({ x: x / this.scale, y: y / this.scale })
      crop.x(x)
      cropStroke.x(x)
      crop.y(y)
      cropStroke.y(y)
    })

    crop.on("mouseenter", () => stage.container().style.cursor = 'move')
    crop.on("mouseleave", () => stage.container().style.cursor = 'default')
    crop.on('dragstart', () => stage.container().style.cursor = 'move')
    crop.on('dragend', () => stage.container().style.cursor = 'default')

    resize.on("dragmove", (evt) => {
      const scaleY = evt.evt.movementY
      const scale = scaleY  > 0 || isNotOutOfScale(scaleY) ? scaleY : 0
      cropStroke.radius(cropStroke.radius() - calcScaleRadius(scale))
      crop.radius(crop.radius() - calcScaleRadius(scale))
      resize.fire('resize')
    })
    resize.on("dragend", () => this.onCrop(getPreview()))

    resize.on('resize', () => moveResizer(crop.x(), crop.y()))

    resize.on("mouseenter", () => stage.container().style.cursor = 'nesw-resize')
    resize.on("mouseleave", () => stage.container().style.cursor = 'default')
    resize.on('dragstart', () => stage.container().style.cursor = 'nesw-resize')
    resize.on('dragend', () => stage.container().style.cursor = 'default')
  }

  initStage() {
    return new Konva.Stage({
      container: this.containerId,
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
      opacity: 1,
      draggable: true,
      dashEnabled: true,
      dash: [10, 5]
    })
  }

  initCropStroke() {
    return new Konva.Circle({
      x: this.halfWidth,
      y: this.halfHeight,
      radius: this.cropRadius,
      stroke: '#FFF',
      strokeWidth: 2,
      strokeScaleEnabled: true,
      dashEnabled: true,
      dash: [10, 5]
    })
  }

  initResize() {
    return new Konva.Rect({
      x: this.halfWidth + this.cropRadius * 0.86 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 8,
      width: 16,
      height: 16,
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
      x: this.halfWidth + this.cropRadius * 0.86 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 10,
      data: 'M47.624,0.124l12.021,9.73L44.5,24.5l10,10l14.661-15.161l9.963,12.285v-31.5H47.624z M24.5,44.5   L9.847,59.653L0,47.5V79h31.5l-12.153-9.847L34.5,54.5L24.5,44.5z',
      fill: '#FFF',
      scale: {
        x : 0.2,
        y : 0.2
      }
    })
  }

  render() {
    const style = {
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: this.backgroundColor,
      width: this.props.width || this.width
    }

    const inputStyle = {
      width: 0.1,
      height: 0.1,
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1,
    }

    const labelStyle = {
      fontSize: '1.25em',
      fontWeight: '700',
      color: 'black',
      display: 'inline-block',
      fontFamily: 'sans-serif',
      lineHeight: (this.props.height || 200) + 'px',
      cursor: 'pointer'
    }

    const borderStyle = {
      border: '2px solid #979797',
      borderStyle: 'dashed',
      borderRadius: '8px',
      textAlign: 'center',
      width: this.props.width || 200,
      height: this.props.height || 200
    }

    return (
      <div>
        {
          this.state.showLoader ?
            <div style={borderStyle}>
              <input onChange={(e) => this.onFileLoad(e)} name={this.loaderId} type="file" id={this.loaderId} style={inputStyle}/>
              <label htmlFor={this.loaderId} style={labelStyle}>Choose a file</label>
            </div>
            : <div id={this.containerId} style={style}/>
        }
      </div>
    )
  }
}

export default Avatar