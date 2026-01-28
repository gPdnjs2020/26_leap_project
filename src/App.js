import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Header from './components/Header'; // 👈 방금 만든 헤더 불러오기
import Home from './pages/Home';
import Create from './pages/Create';
import Run from './pages/Run';
import MyPage from './pages/MyPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/run/:id" element={<Run />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;