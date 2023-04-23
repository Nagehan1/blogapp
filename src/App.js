import React from 'react';
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Write from "./components/Write";
import Read from "./components/Read";
import Logout from "./components/Logout";
import Edit from "./components/Edit";
import { Route, Routes } from "react-router";
// import {BrowserRouter} from "react-router-dom";
import AboutMe from './components/AboutMe';
import './App.css';

function App() {
  return (
    <div>
      {/* <BrowserRouter> */}
      <Routes>
        <Route path={"/"} element={<Login />} />
        <Route path={"/register"} element={<Register />} />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/home"} element={<Home />} />
        <Route path={"/write"} element={<Write />} />
        <Route path={"/read/:postId"} element={<Read />} />
        <Route path="/logout" element={<Logout />} />
        <Route path={"/edit/:postId"} element={<Edit />} />
        <Route path="/aboutme" element={<AboutMe />} />
      </Routes>
      {/* </BrowserRouter> */}
    </div>
  );
}

export default App;
