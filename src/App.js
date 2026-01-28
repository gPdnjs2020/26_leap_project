import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import MyPage from './pages/MyPage';
import Run from './pages/Run';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Routes>
          {/* 메인 페이지 */}
          <Route path="/" element={<Home />} />
          {/* 도약 생성 (목표+스텝 설정) */}
          <Route path="/create" element={<Create />} />
          {/* 마이 페이지 (리스트 확인) */}
          <Route path="/mypage" element={<MyPage />} />
          {/* 실행 페이지 */}
          <Route path="/run/:id" element={<Run />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;