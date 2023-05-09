import React from 'react';
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Write from "./components/Write";
import Read from "./components/Read";

import Edit from "./components/Edit";
import { Route, Routes } from "react-router";
// import {BrowserRouter} from "react-router-dom";
// import AboutMe from './components/AboutMe';
import './App.css';
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

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
       
        <Route path={"/edit/:postId"} element={<Edit />} />
        {/* <Route path="/aboutme" element={<AboutMe />} /> */}
      </Routes>
      {/* </BrowserRouter> */}
    </div>
  );
}

export default App;
