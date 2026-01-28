import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  useEffect(() => {
    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    setLeaps(savedLeaps);
  }, []);

  return (
    <>
      <header className="forest-header">
        <Link to="/" className="logo">🌲 Leap Step</Link>
        <span style={{fontSize: '14px', opacity: 0.7}}>나만의 숲</span>
      </header>

      <div className="forest-field">
        {leaps.length === 0 ? (
          <div style={{marginTop: '100px', textAlign: 'center', opacity: 0.6, width: '100%'}}>
            <p>아직 숲이 비어있네요.<br/>우측 하단 버튼을 눌러 첫 씨앗을 심어보세요!</p>
          </div>
        ) : (
          leaps.map((leap) => {
            // 1. 진행률 계산
            const safeChecked = leap.checked || [];
            const progress = safeChecked.filter(Boolean).length;
            const totalActions = (leap.actions || []).length;

            // 2. 다 컸는지 확인 (3개 다 체크됨)
            // (혹시 모를 에러 방지를 위해 action이 0개보다 많을 때만 체크)
            const isFullyGrown = totalActions > 0 && progress === totalActions;
            
            // 3. 크기 결정 (다 컸으면 2.2배 고정, 아니면 진행률 따라 커짐)
            const scaleSize = isFullyGrown ? 2.2 : 1 + (progress * 0.35); 

            return (
              <div 
                key={leap.id} 
                className={`living-footprint ${isFullyGrown ? 'grown-tree' : ''}`}
                onClick={() => navigate(`/run/${leap.id}`)}
              >
                {/* 4. 아이콘 결정: 다 컸으면 나무🌳, 아니면 발자국👣 */}
                <span 
                  className="foot-icon" 
                  style={{ transform: `scale(${scaleSize})` }}
                >
                  {isFullyGrown ? '🌳' : '👣'}
                </span>
                
                <span className="foot-label">{leap.goal}</span>
              </div>
            );
          })
        )}
      </div>

      <button className="fab-btn" onClick={() => navigate('/create')}>
        +
      </button>
    </>
  );
}

export default Home;