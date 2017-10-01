import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from '../lib/avatar.jsx';

ReactDOM.render(
  <Avatar
    width={384}
    height={458}
    cropRadius={150}
    src={'http://topmira.com/images/5/models-2015/Кара%20Делевинь%20%20Cara%20Delevingne%20фото.jpg'}
  />,
  document.getElementById('root')
)