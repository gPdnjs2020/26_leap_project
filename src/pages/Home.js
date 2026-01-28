import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// App.js에서 전달받은 isMuted(소리 끔 여부)를 사용합니다.
function Home({ isMuted }) {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  useEffect(() => {
    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    
    // 🛠️ [데이터 수리] 위치(x, y)가 없는 "옛날 데이터"들에게 랜덤 위치 부여
    let hasChanges = false;
    
    const fixedLeaps = savedLeaps.map(leap => {
      // 만약 x나 y 좌표가 없다면? (옛날 데이터라면)
      if (leap.x === undefined || leap.y === undefined) {
        hasChanges = true;
        return {
          ...leap,
          // 숲 안쪽 안전한 구역에 랜덤 배치
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 70) + 15
        };
      }
      return leap; // 이미 위치가 있으면 그대로 둠
    });

    // 변경된 내용이 있으면 저장소에도 업데이트
    if (hasChanges) {
      localStorage.setItem('leaps', JSON.stringify(fixedLeaps));
    }
    
    setLeaps(fixedLeaps);
  }, []);

  // 🎵 발자국/나무 클릭 시 재생되는 효과음
  const playStepSound = () => {
    if (!isMuted) {
      const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/k380/wood_tap.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log(e));
    }
  };

  return (
    <>
      <div className="forest-field">
        {leaps.length === 0 ? (
          <div className="empty-message">
            <p>아직 숲이 비어있네요.<br/>우측 하단 버튼을 눌러 첫 씨앗을 심어보세요!</p>
          </div>
        ) : (
          leaps.map((leap) => {
            // 1. 진행 상태 계산
            const safeChecked = leap.checked || [];
            const progress = safeChecked.filter(Boolean).length;
            const totalActions = (leap.actions || []).length;
            
            // 2. 나무 성장 여부 확인 (3단계 완료 시)
            const isFullyGrown = totalActions > 0 && progress === totalActions;
            
            // 3. 크기 계산 (나무는 2.2배, 발자국은 진행도에 따라 커짐)
            const scaleSize = isFullyGrown ? 2.2 : 1 + (progress * 0.35); 

            // 4. 위치 및 스타일 설정
            const positionStyle = {
              left: `${leap.x}%`, 
              top: `${leap.y}%`,
              transform: `translate(-50%, -50%)`,
              zIndex: isFullyGrown ? 5 : 1 // 나무가 발자국보다 앞으로 오게
            };

            return (
              <div 
                key={leap.id} 
                className={`living-footprint ${isFullyGrown ? 'grown-tree' : ''}`}
                style={positionStyle}
                onClick={() => {
                  playStepSound(); // 클릭 시 소리 재생
                  navigate(`/run/${leap.id}`);
                }}
              >
                {/* 아이콘: 다 컸으면 나무(🌳), 아니면 발자국(👣) */}
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

      {/* 우측 하단 생성 버튼 */}
      <button className="fab-btn" onClick={() => navigate('/create')}>+</button>
    </>
  );
}

export default Home;