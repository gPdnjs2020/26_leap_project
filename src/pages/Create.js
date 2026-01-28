import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [actions, setActions] = useState(['', '', '']);

  const handleStart = () => {
    // 1. 기존 데이터 불러오기
    const currentLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    
    let newX, newY;
    let isSafe = false;
    let attempts = 0;

    // 2. 안전한 자리 찾기 (최대 50번 시도)
    while (!isSafe && attempts < 50) {
      // 랜덤 좌표 생성 (화면의 10% ~ 90% 사이)
      // 헤더나 바닥에 너무 붙지 않게 범위를 조절했습니다.
      newX = Math.floor(Math.random() * 80) + 10; 
      newY = Math.floor(Math.random() * 70) + 15; // 헤더 고려해서 위쪽 여유 둠

      isSafe = true; // 일단 안전하다고 가정

      // 기존 발자국들과 거리 비교
      for (const leap of currentLeaps) {
        // 기존 데이터에 좌표가 없으면 중앙(50)으로 가정
        const existingX = leap.x || 50;
        const existingY = leap.y || 50;

        // 피타고라스 정리를 이용한 거리 계산 (두 점 사이의 거리)
        const distance = Math.sqrt(
          Math.pow(newX - existingX, 2) + Math.pow(newY - existingY, 2)
        );

        // 거리가 15% 미만이면 "너무 가깝다"고 판단하고 다시 뽑기
        if (distance < 15) {
          isSafe = false;
          break; // 포문 탈출하고 다시 while문 돌기
        }
      }
      attempts++;
    }

    // 50번 시도해도 자리가 없으면 그냥 마지막에 뽑은 자리에 배치 (겹치더라도)
    
    const newId = Date.now();
    const newLeap = {
      id: newId,
      goal: goal,
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

  // 화면 렌더링 부분 (기존과 동일)
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