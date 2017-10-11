# react-avatar
👤 Load, crop and preview avatar with ReactJS component

## Demo

![](https://media.giphy.com/media/3o7aD1fCeJxzNu2uYg/giphy.gif)

## Usage

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Avatar from 'react-avatar-edit'

class App extends React.Component {

  constructor(props) {
    super(props)
    const src = './example/einshtein.jpg'
    this.state = {
      preview: null,
      src
    }
    this.onCrop = this.onCrop.bind(this)
    this.onClose = this.onClose.bind(this)
  }
  
  onClose() {
    this.setState({preview: null})
  }
  
  onCrop(preview) {
    this.setState({preview})
  }
  
  render () {
    return (
      <div>
        <Avatar
          width={390}
          height={295}
          onCrop={this.onCrop}
          onClose={this.onClose}
          src={this.state.src}
        />
        <img src={this.state.preview} alt="Preview" />
      </div>
    )
  }
}

ReactDOM.render(<App /> , document.getElementById('root'))
```

## Component properties

| Prop                   | Type             | Description
| ---------------------- | ---------------- | ---------------
| img                    | Image            | The Image object to display
