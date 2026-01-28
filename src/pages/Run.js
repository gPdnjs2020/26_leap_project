import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Run({ isMuted }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [leap, setLeap] = useState(null);
  
  // ✏️ 수정 모드 상태들
  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState('');
  const [editActions, setEditActions] = useState([]);
  const [editCategory, setEditCategory] = useState('health'); // 🌲 카테고리 수정용

  // 나무 옵션 데이터 (Create 페이지와 동일)
  const treeOptions = [
    { type: 'health', icon: '🌲', label: '건강' },
    { type: 'study',  icon: '🍂', label: '공부' },
    { type: 'hobby',  icon: '🌸', label: '취미' },
    { type: 'money',  icon: '🍎', label: '금전' },
  ];

  useEffect(() => {
    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const target = allLeaps.find(item => item.id === parseInt(id));
    setLeap(target);
  }, [id]);

  // 🎵 소리 (기존 유지)
  const playCheckSound = () => {
    if (!isMuted) {
      new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3").play().catch(e=>console.log(e));
    }
  };
  const playSuccessSound = () => {
    if (!isMuted) {
      const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/orders/ammo_pickup.mp3");
      audio.volume = 0.6;
      audio.play().catch(e=>console.log(e));
    }
  };

  // ✅ 체크 (기존 유지)
  const handleCheck = (index) => {
    if (!leap || isEditing) return;
    
    playCheckSound();

    const currentChecked = leap.checked || [false, false, false];
    const newChecked = [...currentChecked];
    newChecked[index] = !newChecked[index];

    if (newChecked.filter(Boolean).length === (leap.actions || []).length) {
      setTimeout(playSuccessSound, 300); 
    }

    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const updatedLeaps = allLeaps.map(item => item.id === leap.id ? { ...item, checked: newChecked } : item);

    localStorage.setItem('leaps', JSON.stringify(updatedLeaps));
    setLeap({ ...leap, checked: newChecked });
  };

  // 🗑️ 삭제
  const handleDelete = () => {
    if(window.confirm("이 도약을 숲에서 지울까요?")) {
      const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
      const filtered = allLeaps.filter(item => item.id !== leap.id);
      localStorage.setItem('leaps', JSON.stringify(filtered));
      navigate('/');
    }
  };

  // ✏️ 수정 시작
  const startEditing = () => {
    setEditGoal(leap.goal);
    setEditActions([...leap.actions]);
    setEditCategory(leap.category || 'health'); // 현재 카테고리 불러오기
    setIsEditing(true);
  };

  // 💾 저장
  const saveEditing = () => {
    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const updatedLeaps = allLeaps.map(item => {
      if (item.id === leap.id) {
        return { 
          ...item, 
          goal: editGoal, 
          actions: editActions,
          category: editCategory // ⭐ 바뀐 카테고리 저장
        };
      }
      return item;
    });

    localStorage.setItem('leaps', JSON.stringify(updatedLeaps));
    setLeap({ ...leap, goal: editGoal, actions: editActions, category: editCategory });
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  if (!leap) return <div className="forest-field">로딩중...</div>;
  const safeChecked = leap.checked || [false, false, false];
  const count = safeChecked.filter(Boolean).length;
  
  // 현재 아이콘 찾기
  const currentIcon = treeOptions.find(t => t.type === (isEditing ? editCategory : leap.category))?.icon || '🌲';

  return (
    <>
      <div className="modal-overlay">
        <div className="detail-card">
          
          {/* 상단 헤더 영역 */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px'}}>
            <div style={{flex:1}}>
              {isEditing ? (
                <>
                  <input 
                    value={editGoal} 
                    onChange={(e) => setEditGoal(e.target.value)}
                    style={{fontSize:'20px', fontWeight:'bold', padding:'8px', width:'100%', boxSizing:'border-box'}}
                    autoFocus
                  />
                  
                  {/* ⭐ [추가됨] 수정 모드일 때 나무 선택 버튼들 */}
                  <div style={{display:'flex', gap:'8px', marginTop:'10px'}}>
                    {treeOptions.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setEditCategory(opt.type)}
                        style={{
                          background: editCategory === opt.type ? '#e8f5e9' : '#f5f5f5',
                          border: editCategory === opt.type ? '2px solid #2e7d32' : '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          width: 'auto'
                        }}
                        title={opt.label}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <span style={{fontSize:'28px'}}>{currentIcon}</span>
                  <h2>{leap.goal}</h2>
                </div>
              )}
            </div>

            <div style={{display:'flex', gap:'5px', minWidth:'70px', justifyContent:'flex-end'}}>
              {isEditing ? (
                <>
                  <button onClick={saveEditing} title="저장" style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer', padding:'5px'}}>💾</button>
                  <button onClick={cancelEditing} title="취소" style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer', padding:'5px'}}>❌</button>
                </>
              ) : (
                <>
                  <button onClick={startEditing} title="수정" style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer', padding:'5px'}}>✏️</button>
                  <button onClick={handleDelete} title="삭제" style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer', padding:'5px'}}>🗑️</button>
                </>
              )}
            </div>
          </div>
          
          {!isEditing && (
            <p style={{color: '#666', marginTop: '5px'}}>
              현재 발자국 크기: <strong>{1 + count * 0.3}배</strong>
            </p>
          )}

          <div className="checklist" style={{marginTop:'15px'}}>
            {(isEditing ? editActions : (leap.actions || [])).map((act, i) => (
              <div key={i} 
                className={`check-item ${safeChecked[i] && !isEditing ? 'done' : ''}`}
                onClick={() => handleCheck(i)}
                style={{ cursor: isEditing ? 'default' : 'pointer' }}
              >
                {!isEditing && <input type="checkbox" checked={safeChecked[i]} readOnly />}
                
                {isEditing ? (
                  <input 
                    value={act} 
                    onChange={(e) => {
                      const copy = [...editActions];
                      copy[i] = e.target.value;
                      setEditActions(copy);
                    }}
                    style={{padding:'10px', fontSize:'15px', width:'100%'}}
                    placeholder={`Step ${i+1}`}
                  />
                ) : (
                  <span>{act}</span>
                )}
              </div>
            ))}
          </div>

          {!isEditing && (
            <button className="primary-btn" style={{marginTop: '20px'}} onClick={() => navigate('/')}>
              저장하고 숲으로 가기 🏃‍♂️
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Run;