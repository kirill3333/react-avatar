import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from '../src/avatar.jsx';

class App extends React.Component {

  constructor(props) {
    super(props)
    const src = './example/Cara-Delevingne.jpg'
    this.state = {
      preview: '',
      src
    }
    this.onCrop = this.onCrop.bind(this)
  }

  onCrop(preview) {
    this.setState({preview})
  }

  render() {
    return (
      <div>
        <Avatar
          width={350}
          height={400}
          cropRadius={150}
          onCrop={this.onCrop}
          src={this.state.src}
        />
        <img src={this.state.preview}/>
      </div>

    )
  }
}

ReactDOM.render(<App /> , document.getElementById('root')
)