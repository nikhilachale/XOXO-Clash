
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GameBoard from './components/GameBoard.tsx';
import Home from './components/Home.tsx';
import Header from './components/Header.tsx';


function App() {
  return (
    
    <>
      <Header/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<GameBoard />} />

        </Routes>
      </BrowserRouter>s
    </>

  );
}

export default App;