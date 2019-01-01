import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from './App'

declare var document: any

ReactDOM.render(
    <App />,
    document.getElementById("example")
);
