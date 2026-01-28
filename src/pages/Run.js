import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Run({ isMuted }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leap, setLeap] = useState(null);

  useEffect(() => {
    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const target = allLeaps.find(item => item.id === parseInt(id));
    setLeap(target);
  }, [id]);

  // 🎵 [수정됨] 끊기지 않는 안정적인 소리 링크로 교체
  const playCheckSound = () => {
    if (!isMuted) {
      // 뽁! 하는 소리
      const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log(e));
    }
  };

  const playSuccessSound = () => {
    if (!isMuted) {
      // 띠링~ (아이템 획득 소리)
      const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/orders/ammo_pickup.mp3");
      audio.volume = 0.6;
      audio.play().catch(e => console.log(e));
    }
  };

  const handleCheck = (index) => {
    if (!leap) return;
    
    playCheckSound(); // 👈 이제 에러 없이 소리가 날 거예요

    const currentChecked = leap.checked || [false, false, false];
    const newChecked = [...currentChecked];
    newChecked[index] = !newChecked[index];

    // 3개 다 체크되면 성공 소리!
    if (newChecked.filter(Boolean).length === (leap.actions || []).length) {
      setTimeout(playSuccessSound, 300); 
    }

    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const updatedLeaps = allLeaps.map(item => item.id === leap.id ? { ...item, checked: newChecked } : item);

    localStorage.setItem('leaps', JSON.stringify(updatedLeaps));
    setLeap({ ...leap, checked: newChecked });
  };

  const handleDelete = () => {
    if(window.confirm("이 도약을 숲에서 지울까요?")) {
      const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
      const filtered = allLeaps.filter(item => item.id !== leap.id);
      localStorage.setItem('leaps', JSON.stringify(filtered));
      navigate('/');
    }
  }

  if (!leap) return <div className="forest-field">로딩중...</div>;
  const safeChecked = leap.checked || [false, false, false];
  const count = safeChecked.filter(Boolean).length;

  return (
    <>
      <div className="modal-overlay">
        <div className="detail-card">
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h2>{leap.goal}</h2>
            <button onClick={handleDelete} style={{background:'none', border:'none', fontSize:'18px', cursor:'pointer', width:'auto', boxShadow:'none'}}>🗑️</button>
          </div>
          
          <p style={{color: '#666', marginBottom: '20px'}}>
            현재 발자국 크기: <strong>{1 + count * 0.3}배</strong>
          </p>

          <div className="checklist">
            {(leap.actions || []).map((act, i) => (
              <div key={i} 
                className={`check-item ${safeChecked[i] ? 'done' : ''}`}
                onClick={() => handleCheck(i)}
              >
                <input type="checkbox" checked={safeChecked[i]} readOnly />
                {act}
              </div>
            ))}
          </div>

          <button className="primary-btn" style={{marginTop: '20px'}} onClick={() => navigate('/')}>
            저장하고 숲으로 가기 🏃‍♂️
          </button>
        </div>
      </div>
    </>
  );
}

export default Run;