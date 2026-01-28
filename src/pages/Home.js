import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  // 저장된 데이터 불러오기
  useEffect(() => {
    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    setLeaps(savedLeaps);
  }, []);

  return (
    <div className="container center">
      <h1>Leap Step 👣</h1>
      <p>당신의 작은 도약들이 모여<br/>큰 길을 만듭니다.</p>

      {/* 시각화: 도약 하나당 발자국 아이콘 하나 */}
      <div className="footprint-path">
        {leaps.length === 0 ? (
          <div className="empty-path">아직 첫 발자국이 없네요!</div>
        ) : (
          leaps.map((leap, index) => (
            <span key={index} className="footprint" title={leap.goal}>
              👣
            </span>
          ))
        )}
      </div>
      
      <p className="status-text">총 <strong>{leaps.length}</strong>번의 도약</p>

      <div className="btn-group">
        <button className="primary-btn" onClick={() => navigate('/create')}>
          새로운 도약 시작하기
        </button>
        <button className="secondary-btn" onClick={() => navigate('/mypage')}>
          마이페이지 (기록 보기)
        </button>
      </div>
    </div>
  );
}

export default Home;