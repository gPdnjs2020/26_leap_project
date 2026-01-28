import { Link } from 'react-router-dom';
import '../App.css';

// App.js에서 보내준 props(isMuted, toggleSound)를 받습니다.
function Header({ isMuted, toggleSound }) {
  return (
    <header className="forest-header">
      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
        <Link to="/" className="logo">🌲 Leap Step</Link>
        <span style={{fontSize: '14px', opacity: 0.7}}>나만의 숲</span>
      </div>

      {/* 🔊 소리 조절 버튼 */}
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
    </header>
  );
}

export default Header;