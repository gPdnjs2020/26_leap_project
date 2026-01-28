import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  
  // 🌳 나무 종류 상태 (기본값: 소나무)
  const [category, setCategory] = useState('health');
  
  const [actions, setActions] = useState(['', '', '']);

  // 나무 종류 데이터
  const treeOptions = [
    { type: 'health', icon: '🌲', label: '건강/운동' },
    { type: 'study',  icon: '🍂', label: '공부/성장' },
    { type: 'hobby',  icon: '🌸', label: '취미/힐링' },
    { type: 'money',  icon: '🍎', label: '일/재테크' },
  ];

  const handleStart = () => {
    // 1. 기존 데이터 불러오기
    const currentLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    
    // 2. 랜덤 위치 계산 (이전과 동일)
    let newX, newY;
    let isSafe = false;
    let attempts = 0;

    while (!isSafe && attempts < 50) {
      newX = Math.floor(Math.random() * 80) + 10; 
      newY = Math.floor(Math.random() * 70) + 15;
      isSafe = true;

      for (const leap of currentLeaps) {
        const existingX = leap.x || 50;
        const existingY = leap.y || 50;
        const distance = Math.sqrt(Math.pow(newX - existingX, 2) + Math.pow(newY - existingY, 2));

        if (distance < 15) {
          isSafe = false;
          break; 
        }
      }
      attempts++;
    }

    const newId = Date.now();
    const newLeap = {
      id: newId,
      goal: goal,
      category: category, // 👈 ⭐ 선택한 나무 종류 저장!
      actions: actions,
      checked: [false, false, false],
      completed: false,
      date: new Date().toLocaleDateString(),
      x: newX, 
      y: newY  
    };

    localStorage.setItem('leaps', JSON.stringify([...currentLeaps, newLeap]));
    navigate(`/run/${newId}`);
  };

  // --- 화면 렌더링 ---

  if (step === 1) {
    return (
      <div className="container">
        <h2>어떤 도전을 시작할까요?</h2>
        <input 
          placeholder="예: 매일 조깅하기" 
          value={goal} onChange={(e) => setGoal(e.target.value)} 
          style={{marginBottom: '20px'}}
        />

        {/* 🌳 나무 종류 선택 UI */}
        <h3 style={{fontSize:'16px', color:'#666', marginBottom:'10px'}}>이 씨앗의 종류는?</h3>
        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginBottom:'30px'}}>
          {treeOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setCategory(opt.type)}
              style={{
                background: category === opt.type ? '#e8f5e9' : '#fff',
                border: category === opt.type ? '2px solid #2e7d32' : '1px solid #ddd',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: 'none'
              }}
            >
              <span style={{fontSize:'24px'}}>{opt.icon}</span>
              <span style={{fontSize:'11px', color:'#555', marginTop:'5px'}}>{opt.label}</span>
            </button>
          ))}
        </div>

        <button className="primary-btn" onClick={() => setStep(2)} disabled={!goal}>다음</button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="container">
        <h2>3단계 행동 쪼개기</h2>
        <p style={{marginBottom:'20px', color:'#666'}}>
          선택한 나무: {treeOptions.find(t=>t.type===category).icon}
        </p>
        
        {actions.map((act, i) => (
          <input 
            key={i} 
            placeholder={`Step ${i+1}`} 
            value={act} 
            onChange={(e) => {
              const copy = [...actions];
              copy[i] = e.target.value;
              setActions(copy);
            }} 
          />
        ))}
        <button className="primary-btn" onClick={handleStart} disabled={actions.some(a=>!a)}>
          도약 시작하기!
        </button>
      </div>
    );
  }
}

export default Create;