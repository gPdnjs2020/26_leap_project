import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('leaps')) || [];
    // 최신순 정렬 (역순)
    setLeaps(saved.reverse());
  }, []);

  const clearHistory = () => {
    if(window.confirm('모든 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('leaps');
      setLeaps([]);
    }
  };

  return (
    <div className="container">
      <div className="header-row">
        <button className="back-btn" onClick={() => navigate('/')}>← 메인으로</button>
        <h2>나의 도약 기록</h2>
      </div>

      <div className="leap-list">
        {leaps.length === 0 ? (
          <p className="no-data">아직 기록이 없습니다.</p>
        ) : (
          leaps.map((leap) => (
            <div key={leap.id} className="leap-card">
              <div className="leap-date">{leap.date}</div>
              <h3 className="leap-title">{leap.goal}</h3>
              <div className="leap-steps">
                {leap.actions.map((act, i) => (
                  <span key={i} className="step-badge">✔ {act}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {leaps.length > 0 && (
        <button className="text-btn" onClick={clearHistory}>기록 초기화</button>
      )}
    </div>
  );
}

export default MyPage;