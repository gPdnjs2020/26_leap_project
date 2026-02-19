import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Run({ isMuted }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [leap, setLeap] = useState(null);
  
  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState('');
  const [editActions, setEditActions] = useState([]);
  const [editCategory, setEditCategory] = useState('health');

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

  // ✅ 체크 및 보상 로직 (3그루 달성 보너스 추가!)
  const handleCheck = (index) => {
    if (!leap || isEditing) return;
    
    playCheckSound();

    const currentChecked = leap.checked || [false, false, false];
    const newChecked = [...currentChecked];
    newChecked[index] = !newChecked[index];
    
    // 진행도 확인
    const totalActions = (leap.actions || []).length;
    const isComplete = newChecked.filter(Boolean).length === totalActions;
    
    // 이미 보상을 받았는지 확인
    let isRewardClaimed = leap.rewarded || false;

    // 전체 나무 데이터 가져오기 (보너스 계산용 및 업데이트용)
    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];

    // 🎉 완료했고 + 아직 보상을 안 받았다면? -> 도토리 지급!
    if (isComplete && !isRewardClaimed) {
      isRewardClaimed = true; // 보상 받음 처리 (중복 방지)

      // 1. 기본 보상 30개 계산
      let earnedAcorns = 30;
      let alertMessage = "축하합니다! 나무가 다 자랐어요.\n황금 도토리 30개를 얻었습니다! 🌰";

      // 2. 전체 숲에서 "완성된 나무"가 몇 그루인지 계산
      const previouslyGrownCount = allLeaps.filter(l => {
        if (l.id === leap.id) return false; 
        
        const lTotal = (l.actions || []).length;
        const lChecked = (l.checked || []).filter(Boolean).length;
        return lTotal > 0 && lTotal === lChecked;
      }).length;

      const currentGrownCount = previouslyGrownCount + 1; // 방금 완성한 나무 포함

      // 3. 3의 배수(3, 6, 9...)인지 확인하고 보너스 추가!
      if (currentGrownCount % 3 === 0) {
        earnedAcorns += 10; // 보너스 10개 추가 (총 40개)
        alertMessage = `🎉 엄청나요! ${currentGrownCount}번째 나무를 완성했어요!\n황금 도토리 30개 + 보너스 10개 (총 40개)를 얻었습니다! 🌰✨`;
      }

      // 4. 알람 띄우고 도토리 저장하기
      setTimeout(() => {
        playSuccessSound();
        alert(alertMessage);
      }, 300);

      const currentAcorns = parseInt(localStorage.getItem('acorns') || '0');
      localStorage.setItem('acorns', currentAcorns + earnedAcorns);
      
    } else if (isComplete) {
      setTimeout(playSuccessSound, 300);
    }

    const updatedLeaps = allLeaps.map(item => 
      item.id === leap.id 
        ? { ...item, checked: newChecked, rewarded: isRewardClaimed } 
        : item
    );

    localStorage.setItem('leaps', JSON.stringify(updatedLeaps));
    setLeap({ ...leap, checked: newChecked, rewarded: isRewardClaimed });
  };

  const handleDelete = () => {
    if(window.confirm("이 도약을 숲에서 지울까요?")) {
      const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
      const filtered = allLeaps.filter(item => item.id !== leap.id);
      localStorage.setItem('leaps', JSON.stringify(filtered));
      navigate('/');
    }
  };

  const startEditing = () => {
    setEditGoal(leap.goal);
    setEditActions([...leap.actions]);
    setEditCategory(leap.category || 'health');
    setIsEditing(true);
  };

  const saveEditing = () => {
    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const updatedLeaps = allLeaps.map(item => {
      if (item.id === leap.id) {
        return { ...item, goal: editGoal, actions: editActions, category: editCategory };
      }
      return item;
    });
    localStorage.setItem('leaps', JSON.stringify(updatedLeaps));
    setLeap({ ...leap, goal: editGoal, actions: editActions, category: editCategory });
    setIsEditing(false);
  };

  const cancelEditing = () => setIsEditing(false);

  if (!leap) return <div className="forest-field">로딩중...</div>;
  const safeChecked = leap.checked || [false, false, false];
  const count = safeChecked.filter(Boolean).length;
  const currentIcon = treeOptions.find(t => t.type === (isEditing ? editCategory : leap.category))?.icon || '🌲';

  return (
    <div className="modal-overlay">
      <div className="detail-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px'}}>
          <div style={{flex:1}}>
            {isEditing ? (
              <>
                <input value={editGoal} onChange={(e) => setEditGoal(e.target.value)} style={{fontSize:'20px', fontWeight:'bold', padding:'8px', width:'100%'}} autoFocus />
                <div style={{display:'flex', gap:'8px', marginTop:'10px'}}>
                  {treeOptions.map((opt) => (
                    <button key={opt.type} onClick={() => setEditCategory(opt.type)} style={{background: editCategory === opt.type ? '#e8f5e9' : '#f5f5f5', border: editCategory === opt.type ? '2px solid #2e7d32' : '1px solid #ddd', borderRadius: '8px', padding: '6px', fontSize: '18px'}}>{opt.icon}</button>
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
                <button onClick={saveEditing} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer'}}>💾</button>
                <button onClick={cancelEditing} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer'}}>❌</button>
              </>
            ) : (
              <>
                <button onClick={startEditing} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer'}}>✏️</button>
                <button onClick={handleDelete} style={{background:'none', border:'none', fontSize:'22px', cursor:'pointer'}}>🗑️</button>
              </>
            )}
          </div>
        </div>
        
        {!isEditing && <p style={{color: '#666', marginTop: '5px'}}>현재 발자국 크기: <strong>{1 + count * 0.3}배</strong></p>}

        <div className="checklist" style={{marginTop:'15px'}}>
          {(isEditing ? editActions : (leap.actions || [])).map((act, i) => (
            <div key={i} className={`check-item ${safeChecked[i] && !isEditing ? 'done' : ''}`} onClick={() => handleCheck(i)} style={{ cursor: isEditing ? 'default' : 'pointer' }}>
              {!isEditing && <input type="checkbox" checked={safeChecked[i]} readOnly />}
              {isEditing ? <input value={act} onChange={(e) => { const copy = [...editActions]; copy[i] = e.target.value; setEditActions(copy); }} style={{padding:'10px', fontSize:'15px', width:'100%'}} /> : <span>{act}</span>}
            </div>
          ))}
        </div>

        {!isEditing && <button className="primary-btn" style={{marginTop: '20px'}} onClick={() => navigate('/')}>저장하고 숲으로 가기 🏃‍♂️</button>}
      </div>
    </div>
  );
}

export default Run;