import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1:목표입력, 2:스텝설정, 3:진행중, 4:완료
  const [goal, setGoal] = useState('');
  const [actions, setActions] = useState(['', '', '']);
  const [checked, setChecked] = useState([false, false, false]);

  // 완료 후 저장 함수
  const handleComplete = () => {
    const newLeap = {
      id: Date.now(),
      goal: goal,
      actions: actions,
      date: new Date().toLocaleDateString()
    };
    
    // 기존 데이터 가져와서 추가하고 다시 저장 (LocalStorage)
    const currentLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    localStorage.setItem('leaps', JSON.stringify([...currentLeaps, newLeap]));
    
    // 마이페이지로 이동
    navigate('/mypage');
  };

  // --- 화면 렌더링 ---
  
  // 1. 목표 입력
  if (step === 1) {
    return (
      <div className="container">
        <h2>어떤 도전을 망설이고 있나요?</h2>
        <input 
          placeholder="예: 조깅하기" 
          value={goal} onChange={(e) => setGoal(e.target.value)} 
        />
        <button onClick={() => setStep(2)} disabled={!goal}>다음</button>
      </div>
    );
  }

  // 2. 3단계 행동 설정
  if (step === 2) {
    return (
      <div className="container">
        <h2>3단계 행동 쪼개기</h2>
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
        <button onClick={() => setStep(3)} disabled={actions.some(a=>!a)}>도약 시작</button>
      </div>
    );
  }

  // 3. 실행 및 체크 (진행바 포함)
  if (step === 3) {
    const count = checked.filter(Boolean).length;
    return (
      <div className="container">
        <h2>지금 바로 실행하세요!</h2>
        <div className="track">
           {/* 진행률에 따라 움직이는 발자국 */}
          <div className="runner" style={{ left: `${(count/3)*100}%` }}>👣</div>
        </div>
        <div className="checklist">
          {actions.map((act, i) => (
            <div key={i} className={`check-item ${checked[i] ? 'done' : ''}`}
                 onClick={() => {
                   const copy = [...checked];
                   copy[i] = !copy[i];
                   setChecked(copy);
                 }}>
              <input type="checkbox" checked={checked[i]} readOnly />
              {act}
            </div>
          ))}
        </div>
        {count === 3 && (
          <button className="primary-btn" onClick={handleComplete}>도약 완료!</button>
        )}
      </div>
    );
  }
}

export default Create;