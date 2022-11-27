import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import MainPage from './components/Mainpage'
import Register from './components/Register';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
function App() {
  return (
    <BrowserRouter >
    <Sidebar />
    <Routes>
      <Route path='/' element={<MainPage name={'nagy'} />} />
      <Route path='/sign-up' element={<Register />} />
      <Route path='/sign-in' element={<Login />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
