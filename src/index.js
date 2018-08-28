import React from 'react'
import ReactDOM from 'react-dom'
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import App from './containers/App';

import { Web3Provider } from "./providers/web3";

ReactDOM.render(
  <Web3Provider><App /></Web3Provider>,
  document.getElementById('root')
);
