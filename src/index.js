import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto/index.css';
// import './index.css';
// import App from './App';
import ProblemFactory from './ProblemFactory';
import Solver from './Solver'
import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
// ReactDOM.render(<ProblemFactory />, document.getElementById('root'));
ReactDOM.render(<Solver />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
