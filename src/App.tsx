import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import Register from './components/Register';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import ErrorPage from './routes/ErrorPage';
const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <Login />
  },
  {
    path: '/sign-up',
    element: <Register />
  },
  {
    path: '/',
    element: <Sidebar />,
    errorElement: <ErrorPage />,
  },
])
function App() {
  return (
    // <BrowserRouter >
    // <Sidebar />
    // <Routes>
    //   <Route path='/' element={<MainPage name={'nagy'} />} />
    //   <Route path='/sign-up' element={<Register />} />
    //   <Route path='/sign-in' element={<Login />} />
    // </Routes>
    // </BrowserRouter>
    <RouterProvider router={router} />
  );
}

export default App;
