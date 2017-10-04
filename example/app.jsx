import React from 'react'
import ReactDOM from 'react-dom'
import Avatar from '../src/avatar.jsx'

class App extends React.Component {

  constructor(props) {
    super(props)
    const src = './example/Cara-Delevingne.jpg'
    this.state = {
      preview: '',
      src
    }
    this.onCrop = this.onCrop.bind(this)
    this.onClose = this.onClose.bind(this)
  }

  onCrop(preview) {
    this.setState({preview})
  }

  onClose() {
    this.setState({preview: ''})
  }

  render() {
    return (
      <div>
        <Avatar
          width={390}
          height={295}
          cropRadius={150}
          onCrop={this.onCrop}
          onClose={this.onClose}
          src={this.state.src}
        />
        <img style={{width: '100px', height: '100px'}} src={this.state.preview}/>
      </div>

    )
  }
}

ReactDOM.render(<App /> , document.getElementById('root')
)