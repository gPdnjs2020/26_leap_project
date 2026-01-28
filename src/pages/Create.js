import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [actions, setActions] = useState(['', '', '']);

  // "도약 시작" 버튼 누르면 실행
  const handleStart = () => {
    const newId = Date.now(); // 고유 ID 생성
    const newLeap = {
      id: newId,
      goal: goal,
      actions: actions,
      checked: [false, false, false], // 체크 상태 초기화
      completed: false, // 아직 완료 안 됨
      date: new Date().toLocaleDateString()
    };

    // 저장하기
    const currentLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    localStorage.setItem('leaps', JSON.stringify([...currentLeaps, newLeap]));

    // 실행 페이지로 이동! 🚀
    navigate(`/run/${newId}`);
  };

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

  // 2. 스텝 설정 (여기서 끝내고 저장함)
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
        <button onClick={handleStart} disabled={actions.some(a=>!a)}>
          도약 시작하기!
        </button>
      </div>
    );
  }
}

export default Create;