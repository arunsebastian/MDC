import React from "react";
import Home from "../home/Home";
import { Switch, Route,BrowserRouter } from 'react-router-dom';

function App() {
	return <Home/>
	
	// <BrowserRouter>
	// 	<Switch>
	// 		<Route exact path="/"  component={Home} />
	// 	</Switch>
	// </BrowserRouter>
}
export default App;

