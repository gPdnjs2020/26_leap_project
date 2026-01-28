import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('leaps')) || [];
    setLeaps(saved.reverse());
  }, []);

  // 데이터가 완전하지 않은 경우를 대비해 안전하게 필터링
  const ongoing = leaps.filter(leap => !leap.completed);
  const done = leaps.filter(leap => leap.completed);

  const clearHistory = () => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
      localStorage.removeItem('leaps');
      setLeaps([]);
    }
  };

  return (
    <div className="container">
      <div className="header-row">
        <button className="back-btn" onClick={() => navigate('/')}>← 홈으로</button>
        <h2>나의 도약 기록</h2>
      </div>

      {/* 1. 진행 중인 도약 */}
      <h3 className="section-title">🔥 진행 중 ({ongoing.length})</h3>
      <div className="leap-list">
        {ongoing.length === 0 ? <p className="no-data">진행 중인 도약이 없습니다.</p> : 
          ongoing.map((leap) => (
            <div key={leap.id} className="leap-card active" onClick={() => navigate(`/run/${leap.id}`)}>
              <div className="leap-date">{leap.date}</div>
              <h3 className="leap-title">{leap.goal}</h3>
              <div className="status-badge">
                {/* ⚠️ 여기서 에러가 났던 겁니다. 안전하게 수정됨 👇 */}
                {(leap.checked || []).filter(Boolean).length} / 3 단계 완료 (이어서 하기)
              </div>
            </div>
          ))
        }
      </div>

      <hr style={{margin: '30px 0', border: 'none', borderTop: '1px solid #eee'}}/>

      {/* 2. 완료된 도약 */}
      <h3 className="section-title">🏆 완료함 ({done.length})</h3>
      <div className="leap-list">
        {done.length === 0 ? <p className="no-data">아직 완료한 도약이 없습니다.</p> : 
          done.map((leap) => (
            <div key={leap.id} className="leap-card done">
              <div className="leap-date">{leap.date}</div>
              <h3 className="leap-title">{leap.goal}</h3>
              <div className="leap-steps">
                {/* actions가 없을 경우도 대비 */}
                {(leap.actions || []).map((act, i) => (
                  <span key={i} className="step-badge">✔ {act}</span>
                ))}
              </div>
            </div>
          ))
        }
      </div>

      {leaps.length > 0 && (
        <button className="text-btn" onClick={clearHistory}>전체 기록 초기화</button>
      )}
    </div>
  );
}

export default MyPage;