import React from 'react'
import ReactDOM from 'react-dom'
import Avatar from '../src/avatar.jsx'

class App extends React.Component {

  constructor(props) {
    super(props)
    const src = SOURCE_PATH + '/einshtein.jpg'
    this.state = {
      preview: null,
      defaultPreview: null,
      src
    }
    this.onCrop = this.onCrop.bind(this)
    this.onCropDefault = this.onCropDefault.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onCloseDefault = this.onCloseDefault.bind(this)
  }

  onCropDefault(preview) {
    this.setState({defaultPreview: preview})
  }

  onCrop(preview) {
    this.setState({preview})
  }

  onCloseDefault() {
    this.setState({defaultPreview: null})
  }

  onClose() {
    this.setState({preview: null})
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row" style={{backgroundColor: '#a75d61', padding: '8px 0'}}>
          <div className="col-2"/>
          <div className="col-8">
            <img src={SOURCE_PATH + '/user.png'} alt="" style={{ marginTop: '3px', marginRight: '15px', float: 'left', width: '36px', height: '36px'}}/>
            <h1 style={{ marginTop: '3px', color: 'white', fontWeight: 300, fontSize: '2rem'}}>React avatar editor</h1>
          </div>
          <div className="col-2"/>
        </div>
        <div className="row" style={{marginTop: '45px'}}>
          <div className="col-2"/>
          <div className="col-8">
            <h4>Default usage</h4>
          </div>
          <div className="col-2"/>
        </div>
        <div className="row">
          <div className="col-2"/>
          <div className="col-5">
            <Avatar
              width={390}
              height={295}
              exportSize={390}
              onCrop={this.onCropDefault}
              onClose={this.onCloseDefault}
              // src={this.state.src}
            />
          </div>
          <div className="col-2">
            <h5>Preview</h5>
            <img alt="" style={{width: '150px', height: '150px'}} src={this.state.defaultPreview}/>
          </div>
          <div className="col-3"/>
        </div>
        <div className="row" style={{marginTop: '45px'}}>
          <div className="col-2"/>
          <div className="col-8">
            <h4>With provided <code>src</code> property</h4>
          </div>
          <div className="col-2"/>
        </div>
        <div className="row">
          <div className="col-2"/>
          <div className="col-5">
            <Avatar
              width={390}
              height={295}
              cropRadius={50}
              onCrop={this.onCrop}
              onClose={this.onClose}
              src={this.state.src}
            />
          </div>
          <div className="col-2">
            <h5>Preview</h5>
            <img alt="" style={{width: '150px', height: '150px'}} src={this.state.preview}/>
          </div>
          <div className="col-3"/>
        </div>
        <div className="row" style={{backgroundColor: '#b3aeae', marginTop: '45px'}}>
          <div className="col-2"/>
          <div className="col-8" style={{margin: '25px 0'}}>
            <a style={{color: '#ffffff'}} href="https://github.com/kirill3333/react-avatar">Fork me on Github</a>
          </div>
          <div className="col-2"/>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App /> , document.getElementById('root'))
