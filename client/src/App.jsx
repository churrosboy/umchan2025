import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/login';
import Signup1 from './components/signup1';
import Signup2 from './components/signup2';
import Signup3 from './components/signup3';
import Signup4 from './components/signup4';
import Signup5 from './components/signup5';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
        <Route path="/signup4" element={<Signup4 />} />
        <Route path="/signup5" element={<Signup5 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;