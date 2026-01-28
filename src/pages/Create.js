import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [actions, setActions] = useState(['', '', '']);

  // "도약 시작" 버튼 누르면 실행
  const handleStart = () => {
    const newId = Date.now();
    
    // ⭐ 랜덤 위치 생성 (화면의 10% ~ 80% 사이)
    // 너무 구석에 박히지 않게 여백을 둠
    const randomX = Math.floor(Math.random() * 70) + 10; 
    const randomY = Math.floor(Math.random() * 70) + 10;

    const newLeap = {
      id: newId,
      goal: goal,
      actions: actions,
      checked: [false, false, false],
      completed: false,
      date: new Date().toLocaleDateString(),
      x: randomX, // ⭐ X 좌표 저장
      y: randomY  // ⭐ Y 좌표 저장
    };

    const currentLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    localStorage.setItem('leaps', JSON.stringify([...currentLeaps, newLeap]));

    navigate(`/run/${newId}`);
  };

  // ... (아래 렌더링 부분은 기존과 동일) ...
  // 기존 코드 그대로 두시면 됩니다.
  if (step === 1) {
    return (
      <div className="container">
        <h2>어떤 도전을 망설이고 있나요?</h2>
        <input 
          placeholder="예: 조깅하기" 
          value={goal} onChange={(e) => setGoal(e.target.value)} 
        />
        <button className="primary-btn" onClick={() => setStep(2)} disabled={!goal}>다음</button>
      </div>
    );
  }

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
        <button className="primary-btn" onClick={handleStart} disabled={actions.some(a=>!a)}>
          도약 시작하기!
        </button>
      </div>
    );
  }
}

export default Create;