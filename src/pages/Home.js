import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TREE_ICONS = {
  health: '🌲', study: '🍂', hobby: '🌸', money: '🍎', default: '🌲'
};

// 🛒 1. 상점 아이템 확대 (버섯, 밑둥, 모닥불, 텐트 추가!)
const SHOP_ITEMS = [
  { id: 'flower', name: '꽃', icon: '🌸', cost: 10 },
  { id: 'mushroom', name: '버섯', icon: '🍄', cost: 15 },
  { id: 'bench', name: '벤치', icon: '🪑', cost: 20 },
  { id: 'stump', name: '나무밑둥', icon: '🪵', cost: 20 },
  { id: 'lamp', name: '가로등', icon: '💡', cost: 30 },
  { id: 'rock', name: '바위', icon: '🪨', cost: 15 },
  { id: 'campfire', name: '모닥불', icon: '🔥', cost: 35 },
  { id: 'tent', name: '텐트', icon: '⛺', cost: 60 },
  { id: 'pond', name: '연못', icon: 'real-pond', cost: 50 }, 
];

function Home({ isMuted }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [leaps, setLeaps] = useState([]);
  const [isNight, setIsNight] = useState(new Date().getHours() >= 19 || new Date().getHours() < 6);
  const [animals, setAnimals] = useState([]);
  const [acorns, setAcorns] = useState(0);

  const [inventory, setInventory] = useState([]);   
  const [decorations, setDecorations] = useState([]); 
  
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('buy'); 

  // 🛠️ 정원사 모드 (스케일 및 선택된 아이템 상태 추가)
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingTarget, setDraggingTarget] = useState(null);
  const [selectedDeco, setSelectedDeco] = useState(null); // 선택된 아이템 ID 기억

  useEffect(() => {
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
    
    // 장식품을 클릭하면 선택(스케일 조절 패널 띄움), 빈 공간 누르면 해제
    if (type === 'deco') setSelectedDeco(id);
    else setSelectedDeco(null);
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

      const newItem = { uid: Date.now(), scale: 1, ...item }; // 기본 스케일 1 추가
      const newInventory = [...inventory, newItem];
      setInventory(newInventory);
      localStorage.setItem('inventory', JSON.stringify(newInventory));
      
      if(window.confirm("구매 완료! 📦 보관함으로 바로 이동할까요?")) {
        setShopTab('inventory');
      }
    }
  };

  // 🛒 2. 중고 판매 (반값) 기능 추가
  const sellItem = (item) => {
    const sellPrice = Math.floor(item.cost / 2);
    if (window.confirm(`${item.name}을(를) 중고로 판매하고 ${sellPrice}도토리를 받으시겠어요? 💰`)) {
      const newAcorn = acorns + sellPrice;
      setAcorns(newAcorn);
      localStorage.setItem('acorns', newAcorn);

      const newInventory = inventory.filter(i => i.uid !== item.uid);
      setInventory(newInventory);
      localStorage.setItem('inventory', JSON.stringify(newInventory));
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
    setSelectedDeco(item.uid); // 꺼내자마자 바로 선택되도록
    alert(`${item.name} 위치와 크기를 조절해 보세요!`);
  };

  const retrieveItem = (uid) => {
    const target = decorations.find(d => d.uid === uid);
    if (!target) return;

    const newDecorations = decorations.filter(d => d.uid !== uid);
    setDecorations(newDecorations);
    localStorage.setItem('decorations', JSON.stringify(newDecorations));

    const newItem = { ...target };
    delete newItem.x; 
    delete newItem.y;
    
    const newInventory = [...inventory, newItem];
    setInventory(newInventory);
    localStorage.setItem('inventory', JSON.stringify(newInventory));
    
    setSelectedDeco(null); // 보관했으니 선택 해제
  };

  // 📐 3. 아이템 크기 조절 기능
  const changeScale = (uid, delta) => {
    setDecorations(prev => {
      const updated = prev.map(d => {
        if(d.uid === uid) {
          const currentScale = d.scale || 1;
          // 0.5배 ~ 최대 2.5배까지 제한
          const newScale = Math.max(0.5, Math.min(2.5, currentScale + delta)); 
          return { ...d, scale: newScale };
        }
        return d;
      });
      localStorage.setItem('decorations', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`forest-field ${isNight ? 'night-mode' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => setSelectedDeco(null)} // 빈 바탕 누르면 선택 해제
        style={{
          border: isEditMode ? '4px solid #4CAF50' : 'none',
          cursor: isEditMode ? 'grab' : 'default',
          touchAction: 'none'
        }}
      >
        {!isNight && (
          <>
            <div className="sun-glare"></div>
            <div className="cloud" style={{ width: '100px', height: '30px', top: '15%', left: '-20%', animationDuration: '40s' }}></div>
            <div className="cloud" style={{ width: '80px', height: '25px', top: '25%', left: '-10%', animationDuration: '35s', animationDelay: '5s' }}></div>
            <div className="cloud" style={{ width: '120px', height: '40px', top: '10%', left: '-30%', animationDuration: '50s', animationDelay: '10s' }}></div>
            <div className="bird" style={{ top: '20%', animationDuration: '15s' }}>🕊️</div>
            <div className="bird" style={{ top: '30%', animationDuration: '18s', animationDelay: '2s' }}>🕊️</div>
          </>
        )}

        <div className="acorn-counter">🌰 {acorns}</div>
        <button 
          onClick={() => setIsNight(!isNight)}
          style={{
            position: 'fixed', top: '100px', right: '20px', zIndex: 9999,
            background: isNight ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', 
            border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {isNight ? '🌕' : '☀️'}
        </button>

        {isEditMode && !selectedDeco && (
          <div style={{
            position:'fixed', top:'160px', left:'50%', transform:'translateX(-50%)',
            background:'rgba(0,0,0,0.6)', color:'white', padding:'8px 15px', borderRadius:'20px',
            zIndex: 9999, fontSize: '14px', pointerEvents: 'none', textAlign:'center'
          }}>
            이동: 드래그<br/>크기/보관: 아이템 터치
          </div>
        )}

        {/* 📐 아이템 크기 조절 및 보관 패널 */}
        {isEditMode && selectedDeco && (
          <div className="edit-panel" onClick={(e) => e.stopPropagation()}>
            <button className="btn-edit" onClick={() => changeScale(selectedDeco, 0.2)}>➕ 확대</button>
            <button className="btn-edit" onClick={() => changeScale(selectedDeco, -0.2)}>➖ 축소</button>
            <button className="btn-edit danger" onClick={() => retrieveItem(selectedDeco)}>📦 보관</button>
          </div>
        )}

        {/* 🏡 배치된 아이템 렌더링 */}
        {decorations.map((deco) => {
          const isSelected = isEditMode && selectedDeco === deco.uid;
          return (
            <div 
              key={deco.uid}
              className={`decoration-obj ${deco.class || ''}`}
              onPointerDown={(e) => handlePointerDown(e, 'deco', deco.uid)}
              style={{ 
                left: `${deco.x}%`, top: `${deco.y}%`,
                fontSize: deco.icon === 'real-pond' ? undefined : '30px',
                pointerEvents: isEditMode ? 'auto' : 'none', 
                cursor: isEditMode ? 'pointer' : 'default',
                /* 여기서 scale을 적용하여 크기가 커지고 작아지게 만듭니다! */
                transform: `translate(-50%, -50%) scale(${deco.scale || 1})`,
                zIndex: isSelected || (isEditMode && draggingTarget?.id === deco.uid) ? 999 : 3,
                border: isSelected ? '2px dashed #4CAF50' : 'none', // 선택 시 표시
                borderRadius: '10px',
                padding: '2px'
              }}
            >
              {deco.icon === 'real-pond' ? (
                <div className="real-pond"><span className="pond-duck">🦆</span></div>
              ) : (
                <span>{deco.icon}</span>
              )}
            </div>
          );
        })}

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

      <button className="shop-btn" onClick={() => setIsShopOpen(!isShopOpen)} title="상점">🛖</button>
      
      <button 
        className="garden-btn" 
        onClick={() => {
          setIsEditMode(!isEditMode);
          setSelectedDeco(null); // 편집 모드 끄면 선택도 해제
        }}
        title={isEditMode ? "편집 완료하기" : "정원 꾸미기"}
        style={{
          position: 'fixed', bottom: '90px', left: '25px',
          background: isEditMode ? '#4CAF50' : '#fff', color: isEditMode ? '#fff' : '#333',
        }}
      >
        {isEditMode ? '✅' : '🛠️'}
      </button>

      <button className="fab-btn" onClick={() => !isEditMode && navigate('/create')}>+</button>

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
                  <div key={item.uid} className="shop-item-card" style={{background: '#e3f2fd', border:'1px solid #90caf9', cursor:'default'}}>
                    <div style={{height:'40px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'5px'}}>
                      {item.icon === 'real-pond' ? <div style={{fontSize:'20px'}}>🦆</div> : <span className="item-icon">{item.icon}</span>}
                    </div>
                    <div style={{fontSize:'12px', marginBottom: '5px'}}>{item.name}</div>
                    
                    {/* 💰 판매 및 꺼내기 버튼 */}
                    <div className="inv-actions">
                      <button className="btn-inv btn-place" onClick={() => placeItem(item)}>📍 배치</button>
                      <button className="btn-inv btn-sell" onClick={() => sellItem(item)}>💰 팔기</button>
                    </div>
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