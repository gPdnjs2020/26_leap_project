import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function Run() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leap, setLeap] = useState(null);

  useEffect(() => {
    const allLeaps = JSON.parse(localStorage.getItem('leaps')) || [];
    const target = allLeaps.find(item => item.id === parseInt(id));
    setLeap(target);
  }, [id]);

  const handleCheck = (index) => {
    if (!leap) return;
    const currentChecked = leap.checked || [false, false, false];
    const newChecked = [...currentChecked];
    newChecked[index] = !newChecked[index];
    
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
            <button onClick={handleDelete} style={{background:'none', border:'none', fontSize:'18px', cursor:'pointer'}}>🗑️</button>
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

          <button 
            className="primary-btn" 
            style={{marginTop: '20px'}}
            onClick={() => navigate('/')}
          >
            저장하고 숲으로 가기 🏃‍♂️
          </button>
        </div>
      </div>
    </>
  );
}

export default Run;