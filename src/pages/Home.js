import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TREE_ICONS = {
  health: '🌲', study: '🍂', hobby: '🌸', money: '🍎', default: '🌲'
};

// 🛒 상점 아이템 목록 (수정됨: 복잡한 태그 대신 'real-pond'라는 글자 ID만 사용)
const SHOP_ITEMS = [
  { id: 'flower', name: '꽃', icon: '🌸', cost: 10 },
  { id: 'bench', name: '벤치', icon: '🪑', cost: 20 },
  { id: 'lamp', name: '가로등', icon: '💡', cost: 30 },
  { id: 'rock', name: '바위', icon: '🪨', cost: 15 },
  // 👇 여기가 핵심 수정 포인트! 태그 없이 문자열로 식별합니다.
  { id: 'pond', name: '연못', icon: 'real-pond', cost: 50 }, 
];

function Home({ isMuted }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [leaps, setLeaps] = useState([]);
  const [isNight, setIsNight] = useState(new Date().getHours() >= 19 || new Date().getHours() < 6);
  const [animals, setAnimals] = useState([]);
  const [acorns, setAcorns] = useState(0);

  // 📦 인벤토리 시스템
  const [inventory, setInventory] = useState([]);   
  const [decorations, setDecorations] = useState([]); 
  
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('buy'); 

  // 🛠️ 정원사 모드
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingTarget, setDraggingTarget] = useState(null);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    setLeaps(JSON.parse(localStorage.getItem('leaps')) || []);
    setAcorns(parseInt(localStorage.getItem('acorns') || '0'));
    setDecorations(JSON.parse(localStorage.getItem('decorations')) || []);
    setInventory(JSON.parse(localStorage.getItem('inventory')) || []);

    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const grownCount = savedLeaps.filter(leap => {
      const total = (leap.actions || []).length;
      const checked = (leap.checked || []).filter(Boolean).length;
      return total > 0 && total === checked;
    }).length;

    const newAnimals = [];
    if (grownCount >= 3) newAnimals.push({ id: 'sq1', type: '🐿️', class: 'animal-squirrel', x: 20, y: 80 });
    if (grownCount >= 3) newAnimals.push({ id: 'sq2', type: '🐿️', class: 'animal-squirrel', x: 70, y: 60 });
    if (grownCount >= 5) newAnimals.push({ id: 'rb1', type: '🐇', class: 'animal-rabbit', x: 40, y: 85 });
    if (grownCount >= 7) newAnimals.push({ id: 'dr1', type: '🦌', class: 'animal-deer', x: 85, y: 40 });
    if (grownCount >= 10) newAnimals.push({ id: 'br1', type: '🐻', class: 'animal-bear', x: 10, y: 30 });
    setAnimals(newAnimals);
  }, []);

  const handlePointerDown = (e, type, id) => {
    if (!isEditMode) return;
    e.preventDefault(); e.stopPropagation();
    setDraggingTarget({ type, id });
  };

  const handlePointerMove = (e) => {
    if (!isEditMode || !draggingTarget) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newX = Math.min(95, Math.max(5, (clientX / window.innerWidth) * 100));
    const newY = Math.min(95, Math.max(10, (clientY / window.innerHeight) * 100));

    if (draggingTarget.type === 'tree') {
      setLeaps(prev => prev.map(item => item.id === draggingTarget.id ? { ...item, x: newX, y: newY } : item));
    } else if (draggingTarget.type === 'deco') {
      setDecorations(prev => prev.map(item => item.uid === draggingTarget.id ? { ...item, x: newX, y: newY } : item));
    }
  };

  const handlePointerUp = () => {
    if (!isEditMode || !draggingTarget) return;
    if (draggingTarget.type === 'tree') localStorage.setItem('leaps', JSON.stringify(leaps));
    else if (draggingTarget.type === 'deco') localStorage.setItem('decorations', JSON.stringify(decorations));
    setDraggingTarget(null);
  };

  const buyItem = (item) => {
    if (acorns < item.cost) {
      alert("도토리가 부족해요! 🌰");
      return;
    }
    if (window.confirm(`${item.name}을(를) 구매해서 보관함에 넣을까요?`)) {
      const newAcorn = acorns - item.cost;
      setAcorns(newAcorn);
      localStorage.setItem('acorns', newAcorn);

      // 객체를 복사해서 저장 (React Component가 아닌 순수 데이터)
      const newItem = { uid: Date.now(), ...item }; 
      const newInventory = [...inventory, newItem];
      setInventory(newInventory);
      localStorage.setItem('inventory', JSON.stringify(newInventory));
      
      if(window.confirm("구매 완료! 📦 보관함으로 바로 이동할까요?")) {
        setShopTab('inventory');
      }
    }
  };

  const placeItem = (item) => {
    const placedItem = { ...item, x: 50, y: 50 };
    
    const newInventory = inventory.filter(i => i.uid !== item.uid);
    setInventory(newInventory);
    localStorage.setItem('inventory', JSON.stringify(newInventory));

    const newDecorations = [...decorations, placedItem];
    setDecorations(newDecorations);
    localStorage.setItem('decorations', JSON.stringify(newDecorations));

    setIsShopOpen(false); 
    setIsEditMode(true); 
    alert(`${item.name}을(를) 꺼냈습니다! 위치를 잡아주세요.`);
  };

  const retrieveItem = (uid) => {
    const target = decorations.find(d => d.uid === uid);
    if (!target) return;

    if (window.confirm(`${target.name}을(를) 보관함으로 넣을까요?`)) {
      const newDecorations = decorations.filter(d => d.uid !== uid);
      setDecorations(newDecorations);
      localStorage.setItem('decorations', JSON.stringify(newDecorations));

      const newItem = { ...target };
      delete newItem.x; 
      delete newItem.y;
      
      const newInventory = [...inventory, newItem];
      setInventory(newInventory);
      localStorage.setItem('inventory', JSON.stringify(newInventory));
    }
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`forest-field ${isNight ? 'night-mode' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          border: isEditMode ? '4px solid #4CAF50' : 'none',
          cursor: isEditMode ? 'grab' : 'default',
          touchAction: 'none'
        }}
      >
        <div className="acorn-counter">🌰 {acorns}</div>
        <button 
          onClick={() => setIsNight(!isNight)}
          style={{
            position: 'fixed', top: '100px', right: '20px', zIndex: 9999,
            background: isNight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', 
            border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', backdropFilter: 'blur(5px)'
          }}
        >
          {isNight ? '🌕' : '☀️'}
        </button>

        {isEditMode && (
          <div style={{
            position:'fixed', top:'160px', left:'50%', transform:'translateX(-50%)',
            background:'rgba(0,0,0,0.6)', color:'white', padding:'8px 15px', borderRadius:'20px',
            zIndex: 9999, fontSize: '14px', pointerEvents: 'none', textAlign:'center'
          }}>
            이동: 드래그<br/>보관: 아이템 클릭
          </div>
        )}

        {/* 🏡 배치된 아이템 렌더링 (이 부분이 수정됨) */}
        {decorations.map((deco) => (
          <div 
            key={deco.uid}
            className={`decoration-obj ${deco.class || ''}`}
            onPointerDown={(e) => handlePointerDown(e, 'deco', deco.uid)}
            onClick={() => isEditMode && retrieveItem(deco.uid)} 
            style={{ 
              left: `${deco.x}%`, top: `${deco.y}%`,
              // 연못은 폰트 사이즈 영향을 받지 않도록 함
              fontSize: deco.icon === 'real-pond' ? undefined : '30px',
              pointerEvents: isEditMode ? 'auto' : 'none', 
              cursor: isEditMode ? 'pointer' : 'default',
              animation: isEditMode ? 'shake 0.5s infinite alternate' : 'none',
              zIndex: isEditMode && draggingTarget?.id === deco.uid ? 999 : 3
            }}
          >
            {/* 👇 여기가 핵심! 아이콘 이름이 'real-pond'면 그림을 그리고, 아니면 이모지를 출력 */}
            {deco.icon === 'real-pond' ? (
              <div className="real-pond">
                <span className="pond-duck">🦆</span>
              </div>
            ) : (
              <span>{deco.icon}</span>
            )}
          </div>
        ))}

        {animals.map(animal => (
          <div key={animal.id} className={`forest-animal ${animal.class}`} style={{ left: `${animal.x}%`, top: `${animal.y}%` }}>
            {animal.type}
          </div>
        ))}

        {leaps.map((leap) => {
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
              onPointerDown={(e) => handlePointerDown(e, 'tree', leap.id)} 
              style={{
                left: `${leap.x}%`, top: `${leap.y}%`,
                transform: `translate(-50%, -50%)`,
                zIndex: isEditMode && draggingTarget?.id === leap.id ? 999 : (isFullyGrown ? 5 : 1),
                cursor: isEditMode ? 'grabbing' : 'pointer',
              }}
              onClick={() => !isEditMode && navigate(`/run/${leap.id}`)}
            >
              <span className="foot-icon" style={{ transform: `scale(${scaleSize})`, animation: isEditMode ? 'wiggle 1s infinite ease-in-out' : 'none' }}>
                {isFullyGrown ? treeIcon : '👣'}
              </span>
              <span className="foot-label">{leap.goal}</span>
              {isNight && isFullyGrown && !isEditMode && (
                <div className="firefly-container">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="firefly" style={{left:`${Math.random()*80+10}%`, top:`${Math.random()*80+10}%`, animationDelay:`${Math.random()*2}s`}} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- 버튼 그룹 --- */}
      <button className="shop-btn" onClick={() => setIsShopOpen(!isShopOpen)} title="상점">🛖</button>
      
      {/* 🛠️ 정원 관리 버튼 */}
      <button 
        className="garden-btn" 
        onClick={() => setIsEditMode(!isEditMode)}
        title={isEditMode ? "편집 완료하기" : "정원 꾸미기 (나무/아이템 이동)"}
        style={{
          position: 'fixed', 
          bottom: '90px', 
          left: '25px',
          background: isEditMode ? '#4CAF50' : '#fff', 
          color: isEditMode ? '#fff' : '#333',
        }}
      >
        {isEditMode ? '✅' : '🛠️'}
      </button>

      <button className="fab-btn" onClick={() => !isEditMode && navigate('/create')}>+</button>

      {/* 🛍️ 상점 & 보관함 모달 */}
      {isShopOpen && (
        <div className="shop-modal">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
            <h3 style={{margin:0}}>숲속 거래소</h3>
            <button onClick={() => setIsShopOpen(false)} style={{border:'none', background:'none'}}>✖️</button>
          </div>
          
          <div className="shop-tabs">
            <button className={`shop-tab ${shopTab === 'buy' ? 'active' : ''}`} onClick={() => setShopTab('buy')}>
              상점 🛒
            </button>
            <button className={`shop-tab ${shopTab === 'inventory' ? 'active' : ''}`} onClick={() => setShopTab('inventory')}>
              보관함 📦 ({inventory.length})
            </button>
          </div>

          {shopTab === 'buy' && (
            <>
              <p style={{fontSize:'14px', color:'#666', marginBottom:'10px'}}>보유 도토리: <strong>{acorns}개</strong></p>
              <div className="shop-items">
                {SHOP_ITEMS.map((item) => (
                  <div key={item.id} className="shop-item-card" onClick={() => buyItem(item)}>
                    <div style={{height:'40px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'5px'}}>
                      {/* 상점 목록에서도 연못은 오리 이모지로 대체해서 보여줌 */}
                      {item.icon === 'real-pond' ? <div style={{fontSize:'20px'}}>🦆</div> : <span className="item-icon">{item.icon}</span>}
                    </div>
                    <div style={{fontSize:'12px'}}>{item.name}</div>
                    <div className="item-cost">🌰 {item.cost}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {shopTab === 'inventory' && (
            <div className="shop-items">
              {inventory.length === 0 ? (
                <p style={{color:'#999', padding:'20px', width:'100%', textAlign:'center'}}>보관함이 비었습니다.</p>
              ) : (
                inventory.map((item) => (
                  <div key={item.uid} className="shop-item-card" onClick={() => placeItem(item)} style={{background: '#e3f2fd', border:'1px solid #90caf9'}}>
                    <div style={{height:'40px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'5px'}}>
                      {/* 보관함 목록에서도 연못은 오리 이모지로 대체 */}
                      {item.icon === 'real-pond' ? <div style={{fontSize:'20px'}}>🦆</div> : <span className="item-icon">{item.icon}</span>}
                    </div>
                    <div style={{fontSize:'12px'}}>{item.name}</div>
                    <div style={{fontSize:'10px', color:'#1976d2', fontWeight:'bold'}}>꺼내기 📍</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Home;