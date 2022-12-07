import React from "react";
import ReactDOM from "react-dom";
import './i18n/config';
import App from "./App";
import "./assets/scss/style.scss"

const el = document.getElementById("registration-app-cn");

ReactDOM.render(<App />, el);