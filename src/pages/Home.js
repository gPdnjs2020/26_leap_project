import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TREE_ICONS = {
  health: '🌲', study: '🍂', hobby: '🌸', money: '🍎', default: '🌲'
};

// 🛒 상점 아이템 목록
const SHOP_ITEMS = [
  { id: 'bench', icon: '🪑', name: '벤치', cost: 10 },
  { id: 'flower', icon: '🌻', name: '해바라기', cost: 15 },
  { id: 'lamp', icon: '💡', name: '가로등', cost: 20, class: 'decoration-lamp' },
  { id: 'pond', icon: '💧', name: '연못', cost: 30 },
  { id: 'tent', icon: '⛺', name: '텐트', cost: 50 },
];

function Home({ isMuted }) {
  const navigate = useNavigate();
  const [leaps, setLeaps] = useState([]);
  
  // 🌙 밤 모드
  const currentHour = new Date().getHours();
  const [isNight, setIsNight] = useState(currentHour >= 19 || currentHour < 6);

  // 🐿️ 동물 & 🛖 아이템 상태
  const [animals, setAnimals] = useState([]);
  const [acorns, setAcorns] = useState(0);        // 내 도토리
  const [decorations, setDecorations] = useState([]); // 배치된 아이템들
  const [isShopOpen, setIsShopOpen] = useState(false); // 상점 열림 여부

  useEffect(() => {
    // 1. 나무 데이터 불러오기
    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    setLeaps(savedLeaps);

    // 2. 도토리 & 꾸미기 아이템 불러오기
    const savedAcorns = parseInt(localStorage.getItem('acorns') || '0');
    const savedDecorations = JSON.parse(localStorage.getItem('decorations')) || [];
    setAcorns(savedAcorns);
    setDecorations(savedDecorations);

    // 3. 동물 소환 (기존 로직)
    const grownCount = savedLeaps.filter(leap => {
      const total = (leap.actions || []).length;
      const checked = (leap.checked || []).filter(Boolean).length;
      return total > 0 && total === checked;
    }).length;

    const newAnimals = [];
    if (grownCount >= 3) {
      newAnimals.push({ id: 'sq1', type: '🐿️', class: 'animal-squirrel', x: 20, y: 80 });
      newAnimals.push({ id: 'sq2', type: '🐿️', class: 'animal-squirrel', x: 70, y: 60 });
    }
    if (grownCount >= 5) newAnimals.push({ id: 'rb1', type: '🐇', class: 'animal-rabbit', x: 40, y: 85 });
    if (grownCount >= 7) newAnimals.push({ id: 'dr1', type: '🦌', class: 'animal-deer', x: 85, y: 40 });
    if (grownCount >= 10) newAnimals.push({ id: 'br1', type: '🐻', class: 'animal-bear', x: 10, y: 30 });
    
    setAnimals(newAnimals);
  }, []);

  // 🛍️ 아이템 구매 함수
  const buyItem = (item) => {
    if (acorns < item.cost) {
      alert("도토리가 부족해요! 🌰 나무를 더 키워보세요.");
      return;
    }

    if (window.confirm(`${item.name}을(를) ${item.cost} 도토리에 구매할까요?`)) {
      // 1. 도토리 차감
      const newAcornCount = acorns - item.cost;
      setAcorns(newAcornCount);
      localStorage.setItem('acorns', newAcornCount);

      // 2. 아이템 배치 (랜덤 위치)
      const newItem = {
        uid: Date.now(), // 고유 ID
        ...item,
        x: Math.floor(Math.random() * 80) + 10, // 10~90% 사이
        y: Math.floor(Math.random() * 70) + 20, // 20~90% 사이
      };
      
      const newDecos = [...decorations, newItem];
      setDecorations(newDecos);
      localStorage.setItem('decorations', JSON.stringify(newDecos));
      
      alert(`${item.name}이(가) 숲에 도착했습니다!`);
    }
  };

  const playStepSound = () => {
    if (!isMuted) {
      const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/k380/wood_tap.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log(e));
    }
  };

  return (
    <>
      <div className={`forest-field ${isNight ? 'night-mode' : ''}`}>
        
        {/* 🌰 도토리 카운터 (왼쪽 상단) */}
        <div className="acorn-counter">
          <span>🌰</span> {acorns}
        </div>

        {/* 🌙 낮/밤 토글 버튼 */}
        <button 
          onClick={() => setIsNight(!isNight)}
          style={{
            position: 'fixed', top: '100px', right: '20px',
            background: isNight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', 
            border: 'none', borderRadius: '50%', width: '50px', height: '50px',
            fontSize: '24px', cursor: 'pointer', zIndex: 9999,
            backdropFilter: 'blur(5px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {isNight ? '🌕' : '☀️'}
        </button>

        {/* 🛖 배치된 아이템들 렌더링 */}
        {decorations.map((deco) => (
          <div 
            key={deco.uid}
            className={`decoration-obj ${deco.class || ''}`}
            style={{ 
              left: `${deco.x}%`, 
              top: `${deco.y}%`,
              fontSize: deco.id === 'tent' ? '50px' : '30px' // 텐트는 좀 크게
            }}
          >
            {deco.icon}
          </div>
        ))}

        {/* 🐿️ 동물 렌더링 */}
        {animals.map(animal => (
          <div key={animal.id} className={`forest-animal ${animal.class}`} style={{ left: `${animal.x}%`, top: `${animal.y}%` }}>
            {animal.type}
          </div>
        ))}

        {/* 🌳 나무(목표) 렌더링 */}
        {leaps.length === 0 ? (
          <div className="empty-message">
            <p style={{ color: isNight ? '#ddd' : '#666' }}>아직 숲이 조용하네요.<br/>씨앗을 심어보세요!</p>
          </div>
        ) : (
          leaps.map((leap) => {
            const safeChecked = leap.checked || [];
            const progress = safeChecked.filter(Boolean).length;
            const totalActions = (leap.actions || []).length;
            const isFullyGrown = totalActions > 0 && progress === totalActions;
            
            const treeIcon = TREE_ICONS[leap.category] || TREE_ICONS.default;
            const scaleSize = isFullyGrown ? 2.2 : 1 + (progress * 0.35); 
            
            return (
              <div 
                key={leap.id} 
                className={`living-footprint ${isFullyGrown ? 'grown-tree' : ''}`}
                style={{
                  left: `${leap.x}%`, top: `${leap.y}%`,
                  transform: `translate(-50%, -50%)`,
                  zIndex: isFullyGrown ? 5 : 1
                }}
                onClick={() => { playStepSound(); navigate(`/run/${leap.id}`); }}
              >
                <span className="foot-icon" style={{ transform: `scale(${scaleSize})` }}>{isFullyGrown ? treeIcon : '👣'}</span>
                <span className="foot-label">{leap.goal}</span>
                {isNight && isFullyGrown && (
                  <div className="firefly-container">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="firefly" style={{left:`${Math.random()*80+10}%`, top:`${Math.random()*80+10}%`, animationDelay:`${Math.random()*2}s`}} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 🛖 상점 버튼 (왼쪽 하단) */}
      <button className="shop-btn" onClick={() => setIsShopOpen(!isShopOpen)} title="도토리 상점">
        🛖
      </button>

      {/* 🛍️ 상점 모달 창 */}
      {isShopOpen && (
        <div className="shop-modal">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
            <h3 style={{margin:0}}>도토리 상점 🌰</h3>
            <button onClick={() => setIsShopOpen(false)} style={{background:'none', border:'none', fontSize:'18px', cursor:'pointer'}}>✖️</button>
          </div>
          <p style={{fontSize:'14px', color:'#666', marginBottom:'10px'}}>보유 도토리: <strong>{acorns}개</strong></p>
          
          <div className="shop-items">
            {SHOP_ITEMS.map((item) => (
              <div key={item.id} className="shop-item-card" onClick={() => buyItem(item)}>
                <span className="item-icon">{item.icon}</span>
                <div style={{fontWeight:'bold', fontSize:'14px'}}>{item.name}</div>
                <div className="item-cost">🌰 {item.cost}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="fab-btn" onClick={() => navigate('/create')}>+</button>
    </>
  );
}

export default Home;