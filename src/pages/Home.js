import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 나무 종류별 아이콘 매핑
const TREE_ICONS = {
  health: '🌲', // 건강
  study: '🍂',  // 공부
  hobby: '🌸',  // 취미
  money: '🍎',  // 금전
  default: '🌲' // 예전 데이터용 기본값
};

function Home({ isMuted }) {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);

  useEffect(() => {
    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    
    // 데이터 수리 (위치 없는 애들 랜덤 위치 + 카테고리 없는 애들 기본값)
    let hasChanges = false;
    const fixedLeaps = savedLeaps.map(leap => {
      let updated = { ...leap };
      
      // 1. 위치 없으면 추가
      if (updated.x === undefined || updated.y === undefined) {
        hasChanges = true;
        updated.x = Math.floor(Math.random() * 80) + 10;
        updated.y = Math.floor(Math.random() * 70) + 15;
      }

      // 2. ⭐ 카테고리 없으면(옛날 데이터) 'health'로 설정
      if (!updated.category) {
        hasChanges = true;
        updated.category = 'health';
      }
      
      return updated;
    });

    if (hasChanges) {
      localStorage.setItem('leaps', JSON.stringify(fixedLeaps));
    }
    setLeaps(fixedLeaps);
  }, []);

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
            const safeChecked = leap.checked || [];
            const progress = safeChecked.filter(Boolean).length;
            const totalActions = (leap.actions || []).length;
            const isFullyGrown = totalActions > 0 && progress === totalActions;
            
            // ⭐ 카테고리에 맞는 나무 아이콘 가져오기
            const treeIcon = TREE_ICONS[leap.category] || TREE_ICONS.default;

            const scaleSize = isFullyGrown ? 2.2 : 1 + (progress * 0.35); 
            const positionStyle = {
              left: `${leap.x}%`, 
              top: `${leap.y}%`,
              transform: `translate(-50%, -50%)`,
              zIndex: isFullyGrown ? 5 : 1
            };

            return (
              <div 
                key={leap.id} 
                className={`living-footprint ${isFullyGrown ? 'grown-tree' : ''}`}
                style={positionStyle}
                onClick={() => {
                  playStepSound();
                  navigate(`/run/${leap.id}`);
                }}
              >
                <span 
                  className="foot-icon" 
                  style={{ transform: `scale(${scaleSize})` }}
                >
                  {/* 다 컸으면 해당 나무 아이콘, 아니면 발자국 */}
                  {isFullyGrown ? treeIcon : '👣'}
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