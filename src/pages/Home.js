import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TREE_ICONS = {
  health: '🌲', study: '🍂', hobby: '🌸', money: '🍎', default: '🌲'
};

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

  const [forests, setForests] = useState([]);
  const [currentForest, setCurrentForest] = useState('forest-1');
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [leaps, setLeaps] = useState([]);
  const [isNight, setIsNight] = useState(new Date().getHours() >= 19 || new Date().getHours() < 6);
  const [animals, setAnimals] = useState([]);
  const [acorns, setAcorns] = useState(30);

  const [inventory, setInventory] = useState([]);
  const [decorations, setDecorations] = useState([]);

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('buy');

  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingTarget, setDraggingTarget] = useState(null);
  const [selectedDeco, setSelectedDeco] = useState(null);

  useEffect(() => {
    const savedForests = JSON.parse(localStorage.getItem('forests')) || [{ id: 'forest-1', name: '나의 첫 숲 🌲' }];
    const savedCurrent = localStorage.getItem('currentForest') || 'forest-1';

    setForests(savedForests);
    setCurrentForest(savedCurrent);

    setLeaps(JSON.parse(localStorage.getItem('leaps')) || []);
    setAcorns(parseInt(localStorage.getItem('acorns') || '30'));
    setDecorations(JSON.parse(localStorage.getItem('decorations')) || []);
    setInventory(JSON.parse(localStorage.getItem('inventory')) || []);

    const savedLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const currentForestLeaps = savedLeaps.filter(leap => (leap.forestId || 'forest-1') === savedCurrent);
    const grownCount = currentForestLeaps.filter(leap => {
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
  }, [currentForest]);

  const handlePointerDown = (e, type, id) => {
    if (!isEditMode) return;
    e.preventDefault(); e.stopPropagation();
    setDraggingTarget({ type, id });
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

  // ✅ [수정] 한 번에 여러 개 구매 로직
  const buyItem = (item) => {
    const countStr = prompt(`${item.name}을(를) 몇 개 구매하시겠습니까?`, "1");
    if (countStr === null) return;
    const count = parseInt(countStr);
    if (isNaN(count) || count <= 0) {
      alert("올바른 수량을 입력해 주세요.");
      return;
    }

    const totalCost = item.cost * count;
    if (acorns < totalCost) {
      alert(`도토리가 부족해요! 🌰 (필요: ${totalCost}, 보유: ${acorns})`);
      return;
    }

    if (window.confirm(`${item.name} ${count}개를 구매하여 ${totalCost}도토리를 사용하시겠습니까?`)) {
      const newAcorn = acorns - totalCost;
      setAcorns(newAcorn);
      localStorage.setItem('acorns', newAcorn);

      setInventory(prev => {
        const existingIdx = prev.findIndex(i => i.id === item.id);
        let newInv;
        if (existingIdx > -1) {
          newInv = [...prev];
          newInv[existingIdx].quantity = (newInv[existingIdx].quantity || 1) + count;
        } else {
          newInv = [...prev, { ...item, quantity: count, uid: Date.now(), scale: 1 }];
        }
        localStorage.setItem('inventory', JSON.stringify(newInv));
        return newInv;
      });

      if (window.confirm("구매 완료! 📦 보관함으로 바로 이동할까요?")) {
        setShopTab('inventory');
      }
    }
  };

  // ✅ [수정] 한 번에 여러 개 판매 로직
  const sellItem = (item) => {
    const sellPrice = Math.floor(item.cost / 2);
    const currentQty = item.quantity || 1;
    const countStr = prompt(`판매할 개수를 입력하세요 (보유: ${currentQty}개)`, "1");
    if (countStr === null) return;
    const count = parseInt(countStr);

    if (isNaN(count) || count <= 0 || count > currentQty) {
      alert("올바른 수량을 입력해 주세요.");
      return;
    }

    if (window.confirm(`${item.name} ${count}개를 판매하고 ${sellPrice * count}도토리를 받으시겠어요? 💰`)) {
      const newAcorn = acorns + (sellPrice * count);
      setAcorns(newAcorn);
      localStorage.setItem('acorns', newAcorn);

      setInventory(prev => {
        const newInv = prev.map(i => {
          if (i.id === item.id) return { ...i, quantity: i.quantity - count };
          return i;
        }).filter(i => i.quantity > 0);
        localStorage.setItem('inventory', JSON.stringify(newInv));
        return newInv;
      });
    }
  };

  // ✅ [수정] 배치 시 수량 감소 로직
  const placeItem = (item) => {
    const placedItem = { ...item, uid: Date.now(), x: 50, y: 50, forestId: currentForest };
    delete placedItem.quantity; // 필드 위 객체는 수량 속성 제거

    setInventory(prev => {
      const newInv = prev.map(i => {
        if (i.id === item.id) return { ...i, quantity: (i.quantity || 1) - 1 };
        return i;
      }).filter(i => i.quantity > 0);
      localStorage.setItem('inventory', JSON.stringify(newInv));
      return newInv;
    });

    const newDecorations = [...decorations, placedItem];
    setDecorations(newDecorations);
    localStorage.setItem('decorations', JSON.stringify(newDecorations));

    setIsShopOpen(false);
    setIsEditMode(true);
    setSelectedDeco(placedItem.uid);
  };

  // ✅ [수정] 보관 시 수량 증가 로직
  const retrieveItem = (uid) => {
    const target = decorations.find(d => d.uid === uid);
    if (!target) return;

    const newDecorations = decorations.filter(d => d.uid !== uid);
    setDecorations(newDecorations);
    localStorage.setItem('decorations', JSON.stringify(newDecorations));

    setInventory(prev => {
      const existingIdx = prev.findIndex(i => i.id === target.id);
      let newInv;
      if (existingIdx > -1) {
        newInv = [...prev];
        newInv[existingIdx].quantity = (newInv[existingIdx].quantity || 1) + 1;
      } else {
        const newItem = { ...target, quantity: 1 };
        delete newItem.x; delete newItem.y; delete newItem.forestId;
        newInv = [...prev, newItem];
      }
      localStorage.setItem('inventory', JSON.stringify(newInv));
      return newInv;
    });

    setSelectedDeco(null);
  };

  const changeScale = (uid, delta) => {
    setDecorations(prev => {
      const updated = prev.map(d => {
        if (d.uid === uid) {
          const currentScale = d.scale || 1;
          const newScale = Math.max(0.5, Math.min(2.5, currentScale + delta));
          return { ...d, scale: newScale };
        }
        return d;
      });
      localStorage.setItem('decorations', JSON.stringify(updated));
      return updated;
    });
  };

  const createNewForest = () => {
    const newName = prompt("새로운 숲의 이름을 지어주세요! 🌳");
    if (newName) {
      const newForest = { id: `forest-${Date.now()}`, name: newName };
      const updatedForests = [...forests, newForest];
      setForests(updatedForests);
      localStorage.setItem('forests', JSON.stringify(updatedForests));
      setCurrentForest(newForest.id);
      localStorage.setItem('currentForest', newForest.id);
      setIsMapOpen(false);
    }
  };

  const switchForest = (forestId) => {
    setCurrentForest(forestId);
    localStorage.setItem('currentForest', forestId);
    setIsMapOpen(false);
    setSelectedDeco(null);
    setIsEditMode(false);
  };

  const renameForest = (forestId, currentName) => {
    const newName = prompt("숲의 새로운 이름을 지어주세요! ✏️", currentName);
    if (newName && newName.trim() !== "") {
      const updatedForests = forests.map(f => f.id === forestId ? { ...f, name: newName.trim() } : f);
      setForests(updatedForests);
      localStorage.setItem('forests', JSON.stringify(updatedForests));
    }
  };

  const activeDecorations = decorations.filter(d => (d.forestId || 'forest-1') === currentForest);
  const activeLeaps = leaps.filter(l => (l.forestId || 'forest-1') === currentForest);

  return (
    <>
      <div
        ref={containerRef}
        className={`forest-field ${isNight ? 'night-mode' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedDeco(null); }}
        style={{ border: isEditMode ? '4px solid #4CAF50' : 'none', cursor: isEditMode ? 'grab' : 'default', touchAction: 'none' }}
      >
        {!isNight && (
          <>
            <div className="sun-glare"></div>
            <div className="cloud" style={{ width: '100px', height: '30px', top: '15%', left: '-20%', animationDuration: '40s' }}></div>
            <div className="bird" style={{ top: '20%', animationDuration: '15s' }}>🕊️</div>
          </>
        )}

        <div style={{ position: 'fixed', top: '80px', left: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <button onClick={() => setIsMapOpen(true)} style={{ background: 'rgba(255,255,255,0.8)', border: '2px solid #4CAF50', borderRadius: '20px', padding: '5px 15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            🗺️ {forests.find(f => f.id === currentForest)?.name || '숲 이동'}
          </button>
          <div className="acorn-counter" style={{ position: 'static', margin: 0 }}>🌰 {acorns}</div>
        </div>

        <button onClick={() => setIsNight(!isNight)} style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 9999, background: isNight ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', backdropFilter: 'blur(5px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {isNight ? '🌕' : '☀️'}
        </button>

        {activeDecorations.map((deco) => {
          const currentScale = deco.scale || 1;
          const isSelected = isEditMode && selectedDeco === deco.uid;
          return (
            <div
              key={deco.uid}
              className={`decoration-obj ${deco.class || ''}`}
              onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'deco', deco.uid); }}
              onClick={(e) => e.stopPropagation()}
              style={{ left: `${deco.x}%`, top: `${deco.y}%`, fontSize: deco.icon === 'real-pond' ? undefined : '30px', pointerEvents: isEditMode ? 'auto' : 'none', cursor: isEditMode ? 'grab' : 'default', transform: `translate(-50%, -50%) scale(${currentScale})`, zIndex: isSelected || (isEditMode && draggingTarget?.id === deco.uid) ? 999 : 3, border: isSelected ? '2px dashed #4CAF50' : 'none', borderRadius: '10px', position: 'absolute' }}
            >
              {isSelected && (
                <div className="item-edit-panel" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} style={{ transform: `translateX(-50%) scale(${1 / currentScale})`, transformOrigin: 'bottom center' }}>
                  <button className="btn-edit" onClick={() => changeScale(deco.uid, 0.2)}>➕ 확대</button>
                  <button className="btn-edit" onClick={() => changeScale(deco.uid, -0.2)}>➖ 축소</button>
                  <button className="btn-edit danger" onClick={() => retrieveItem(deco.uid)}>📦 보관</button>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                {deco.icon === 'real-pond' ? <div className="real-pond"><span className="pond-duck">🦆</span></div> : <span style={{ filter: (isNight && (deco.id === 'lamp' || deco.id === 'campfire')) ? `drop-shadow(0 0 10px ${deco.id === 'lamp' ? 'rgba(255, 230, 100, 0.8)' : 'rgba(255, 100, 0, 0.8)'})` : 'none' }}>{deco.icon}</span>}
              </div>
            </div>
          );
        })}

        {animals.map(animal => (
          <div key={animal.id} className={`forest-animal ${animal.class}`} style={{ left: `${animal.x}%`, top: `${animal.y}%` }}>{animal.type}</div>
        ))}

        {activeLeaps.map((leap) => {
          const safeChecked = leap.checked || [];
          const progress = safeChecked.filter(Boolean).length;
          const totalActions = (leap.actions || []).length;
          const isFullyGrown = totalActions > 0 && progress === totalActions;
          const treeIcon = TREE_ICONS[leap.category] || TREE_ICONS.default;
          const scaleSize = isFullyGrown ? 2.2 : 1 + (progress * 0.35);
          return (
            <div key={leap.id} className={`living-footprint ${isFullyGrown ? 'grown-tree' : ''}`} onPointerDown={(e) => handlePointerDown(e, 'tree', leap.id)} style={{ left: `${leap.x}%`, top: `${leap.y}%`, transform: `translate(-50%, -50%)`, zIndex: isEditMode && draggingTarget?.id === leap.id ? 999 : (isFullyGrown ? 5 : 1), cursor: isEditMode ? 'grabbing' : 'pointer' }} onClick={() => !isEditMode && navigate(`/run/${leap.id}`)}>
              <span className="foot-icon" style={{ transform: `scale(${scaleSize})`, animation: isEditMode ? 'wiggle 1s infinite ease-in-out' : 'none' }}>
                {isFullyGrown ? treeIcon : '🌱'}
              </span>
              <span className="foot-label">{leap.goal}</span>
            </div>
          );
        })}
      </div>

      <button className="shop-btn" onClick={() => setIsShopOpen(!isShopOpen)} title="상점">🛖</button>
      <button className="garden-btn" onClick={() => { setIsEditMode(!isEditMode); setSelectedDeco(null); }} style={{ position: 'fixed', bottom: '90px', left: '25px', background: isEditMode ? '#4CAF50' : '#fff', color: isEditMode ? '#fff' : '#333' }}>
        {isEditMode ? '✅' : '🛠️'}
      </button>
      <button className="fab-btn" onClick={() => !isEditMode && navigate('/create')}>+</button>

      {isShopOpen && (
        <div className="shop-modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>숲속 거래소</h3>
            <button onClick={() => setIsShopOpen(false)} style={{ border: 'none', background: 'none' }}>✖️</button>
          </div>
          <div className="shop-tabs">
            <button className={`shop-tab ${shopTab === 'buy' ? 'active' : ''}`} onClick={() => setShopTab('buy')}>상점 🛒</button>
            <button className={`shop-tab ${shopTab === 'inventory' ? 'active' : ''}`} onClick={() => setShopTab('inventory')}>보관함 📦</button>
          </div>

          {shopTab === 'buy' ? (
            <div className="shop-items">
              {SHOP_ITEMS.map((item) => (
                <div key={item.id} className="shop-item-card" onClick={() => buyItem(item)}>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>
                    {item.icon === 'real-pond' ? <div style={{ fontSize: '20px' }}>🦆</div> : <span className="item-icon">{item.icon}</span>}
                  </div>
                  <div style={{ fontSize: '12px' }}>{item.name}</div>
                  <div className="item-cost">🌰 {item.cost}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="shop-items">
              {inventory.length === 0 ? <p style={{ color: '#999', padding: '20px', width: '100%', textAlign: 'center' }}>보관함이 비었습니다.</p> : 
                inventory.map((item) => (
                  <div key={item.id} className="shop-item-card" style={{ background: '#e3f2fd', border: '1px solid #90caf9', cursor: 'default', position: 'relative' }}>
                    {/* ✅ 수량 표시 뱃지 */}
                    <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#2196F3', color: 'white', borderRadius: '12px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', border: '2px solid white', zIndex: 10 }}>
                      x{item.quantity || 1}
                    </div>
                    <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>
                      {item.icon === 'real-pond' ? <div style={{ fontSize: '20px' }}>🦆</div> : <span className="item-icon">{item.icon}</span>}
                    </div>
                    <div style={{ fontSize: '11px', marginBottom: '5px' }}>{item.name}</div>
                    <div className="inv-actions" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <button className="btn-inv btn-place" onClick={() => placeItem(item)} style={{ padding: '3px', fontSize: '10px' }}>📍 배치</button>
                      <button className="btn-inv btn-sell" onClick={() => sellItem(item)} style={{ padding: '3px', fontSize: '10px' }}>💰 팔기</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {isMapOpen && (
        <div className="shop-modal" style={{ bottom: '50%', transform: 'translateY(50%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🗺️ 숲속 지도</h3>
            <button onClick={() => setIsMapOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>✖️</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {forests.map(forest => (
              <div key={forest.id} style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => switchForest(forest.id)} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', background: forest.id === currentForest ? '#4CAF50' : '#f1f1f1', color: forest.id === currentForest ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}>
                  {forest.id === currentForest ? '📍 ' : '🌲 '}{forest.name}
                </button>
                <button onClick={(e) => { e.stopPropagation(); renameForest(forest.id, forest.name); }} style={{ padding: '0 15px', borderRadius: '10px', border: 'none', background: '#e0e0e0', cursor: 'pointer' }}>✏️</button>
              </div>
            ))}
            <button onClick={createNewForest} style={{ padding: '15px', borderRadius: '10px', border: '2px dashed #4CAF50', background: 'transparent', color: '#4CAF50', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>➕ 새로운 숲 개척하기</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;