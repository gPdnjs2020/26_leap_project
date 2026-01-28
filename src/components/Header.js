import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

// App.js에서 보내준 props(isMuted, toggleSound)를 받습니다.
function Header({ isMuted, toggleSound }) {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  return (
    <header className="forest-header">
      {/* 왼쪽: 로고 및 앱 이름 */}
      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
        <Link to="/" className="logo">🌲 Leap Step</Link>
        <span style={{fontSize: '14px', opacity: 0.7}}>나만의 숲</span>
      </div>

      {/* 오른쪽: 기능 버튼들 (소리 조절 + 마이페이지) */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        
        {/* 1. 🔊 소리 조절 버튼 */}
        <button 
          onClick={toggleSound}
          style={{
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer',
            padding: '5px',
            width: 'auto',
            boxShadow: 'none'
          }}
          title={isMuted ? "숲의 소리 켜기" : "조용히 하기"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* 2. 👤 마이페이지 이동 버튼 (추가됨) */}
        <button 
          onClick={() => navigate('/mypage')}
          style={{
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer',
            padding: '5px',
            width: 'auto',
            boxShadow: 'none'
          }}
          title="내 숲 분석 보기"
        >
          👤
        </button>

      </div>
    </header>
  );
}

export default Header;