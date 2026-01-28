import { useState, useRef } from 'react'; // useEffect 제거 (필요 없음)
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Create from './pages/Create';
import Run from './pages/Run';
import MyPage from './pages/MyPage';
import './App.css';

function App() {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  // 🔊 소리 토글 함수 (안전장치 추가)
  const toggleSound = async () => {
    const audio = audioRef.current;
    
    if (!audio) return; // 오디오 태그가 없으면 중단

    try {
      if (isMuted) {
        // 1. 소리 켜기 시도
        audio.volume = 0.3; // 볼륨 설정 (너무 크지 않게)
        
        // play()는 Promise를 반환합니다. 재생이 완료될 때까지 기다립니다.
        await audio.play();
        
        // 재생 성공 시에만 상태 변경 (아이콘 변경)
        setIsMuted(false);
      } else {
        // 2. 소리 끄기
        audio.pause();
        setIsMuted(true);
      }
    } catch (error) {
      console.error("오디오 재생 실패:", error);
      alert("배경음악을 재생할 수 없습니다. 브라우저 설정을 확인해주세요.");
      // 에러가 나면 강제로 음소거 상태로 유지
      setIsMuted(true);
    }
  };

  return (
    <BrowserRouter>
      {/* 🎵 배경음악 (소스 교체) 
         가장 호환성이 좋은 무료 MP3 링크로 변경했습니다.
      */}
      <audio 
        ref={audioRef} 
        loop 
        // 크로스 브라우징 이슈가 적은 다른 링크 사용
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=forest-lullaby-110624.mp3"
      />

      <Header isMuted={isMuted} toggleSound={toggleSound} />
      
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<Home isMuted={isMuted} />} />
          <Route path="/create" element={<Create />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/run/:id" element={<Run isMuted={isMuted} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;