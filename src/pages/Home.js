import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Link 삭제 (Header로 이동함)

function Home() {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  useEffect(() => {
    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    setLeaps(savedLeaps);
  }, []);

  return (
    <>
      {/* 헤더 삭제됨 (App.jsx에 있음) */}

      <div className="forest-field">
        {leaps.length === 0 ? (
          <div className="empty-message">
            <p>아직 숲이 비어있네요.<br/>우측 하단 버튼을 눌러 첫 씨앗을 심어보세요!</p>
          </div>
        ) : (
          leaps.map((leap) => {
            const safeChecked = leap.checked || [];
            const progress = safeChecked.filter(Boolean).length;
            const totalActions = (leap.actions || []).length;
            const isFullyGrown = totalActions > 0 && progress === totalActions;
            const scaleSize = isFullyGrown ? 2.2 : 1 + (progress * 0.35); 

            // ⭐ 좌표 스타일 적용
            // 옛날 데이터라 x,y가 없으면 기본값 50%를 줍니다.
            const positionStyle = {
              left: `${leap.x || 50}%`,
              top: `${leap.y || 50}%`,
              transform: `translate(-50%, -50%)`, // 정확한 중심점 잡기
              zIndex: isFullyGrown ? 5 : 1 // 나무는 좀 더 앞으로
            };

            return (
              <div 
                key={leap.id} 
                className={`living-footprint ${isFullyGrown ? 'grown-tree' : ''}`}
                style={positionStyle} // ⭐ 위치 적용
                onClick={() => navigate(`/run/${leap.id}`)}
              >
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

      <button className="fab-btn" onClick={() => navigate('/create')}>+</button>
    </>
  );
}

export default Home;