import { Link } from 'react-router-dom';
import '../App.css'; // 한 단계 위(src)에 있는 css를 가져옴

function Header() {
  return (
    <header className="forest-header">
      <Link to="/" className="logo">🌲 Leap Step</Link>
      <span style={{fontSize: '14px', opacity: 0.7}}>나만의 숲</span>
    </header>
  );
}

export default Header;