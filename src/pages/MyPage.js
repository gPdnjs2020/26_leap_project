import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    grown: 0,
    rate: 0,
    categories: { health: 0, study: 0, hobby: 0, money: 0 }
  });

  useEffect(() => {
    const leaps = JSON.parse(localStorage.getItem('leaps')) || [];
    
    // 1. 전체 통계 계산
    const total = leaps.length;
    
    // 다 큰 나무 계산 (actions가 있고, 체크된 수가 actions 길이와 같을 때)
    const grown = leaps.filter(leap => {
      const checkedCount = (leap.checked || []).filter(Boolean).length;
      const totalActions = (leap.actions || []).length;
      return totalActions > 0 && checkedCount === totalActions;
    }).length;

    // 성공률 (0으로 나누기 방지)
    const rate = total === 0 ? 0 : Math.round((grown / total) * 100);

    // 2. 카테고리별 개수 계산
    const catCounts = { health: 0, study: 0, hobby: 0, money: 0 };
    leaps.forEach(leap => {
      // 카테고리가 없거나 이상하면 'health'로 취급
      const type = leap.category || 'health';
      if (catCounts[type] !== undefined) {
        catCounts[type]++;
      } else {
        catCounts['health']++;
      }
    });

    setStats({
      total,
      grown,
      rate,
      categories: catCounts
    });
  }, []);

  // 🏆 레벨 계산 로직
  const getLevelInfo = (grownCount) => {
    if (grownCount >= 10) return { title: "숲의 주인 👑", desc: "이 구역의 전설입니다!", color: "#FFD700" };
    if (grownCount >= 5)  return { title: "베테랑 정원사 🌿", desc: "이제 숲이 울창하네요.", color: "#4CAF50" };
    if (grownCount >= 1)  return { title: "새싹 지킴이 🌱", desc: "첫 나무를 키워냈군요!", color: "#8BC34A" };
    return { title: "씨앗 요정 🧚", desc: "첫 나무를 심어보세요!", color: "#cfd8dc" };
  };

  const myLevel = getLevelInfo(stats.grown);

  // 카테고리별 색상 및 이름
  const categoryConfig = [
    { type: 'health', icon: '🌲', name: '건강', color: '#4CAF50' },
    { type: 'study',  icon: '🍂', name: '공부', color: '#FF9800' },
    { type: 'hobby',  icon: '🌸', name: '취미', color: '#E91E63' },
    { type: 'money',  icon: '🍎', name: '금전', color: '#F44336' },
  ];

  return (
    <div className="mypage-container">
      
      {/* 1. 레벨 카드 */}
      <div className="level-card">
        <div style={{fontSize: '40px', marginBottom: '10px'}}>
            {stats.grown >= 10 ? '🤴' : stats.grown >= 5 ? '🧑‍🌾' : '🧚'}
        </div>
        <div className="level-title">{myLevel.title}</div>
        <p style={{opacity: 0.9}}>{myLevel.desc}</p>
      </div>

      {/* 2. 핵심 통계 3가지 */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-number">{stats.total}개</span>
          <span className="stat-label">심은 씨앗</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{stats.grown}그루</span>
          <span className="stat-label">다 큰 나무</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{stats.rate}%</span>
          <span className="stat-label">성공률</span>
        </div>
      </div>

      {/* 3. 내 숲의 성향 분석 (그래프) */}
      <div className="analysis-card">
        <h3 style={{marginTop:0, marginBottom:'20px', fontSize:'18px'}}>내 숲의 성향</h3>
        
        {stats.total === 0 ? (
          <p style={{textAlign:'center', color:'#999', padding:'20px'}}>
            아직 데이터가 없어요.<br/>씨앗을 심어보세요!
          </p>
        ) : (
          categoryConfig.map((cat) => {
            const count = stats.categories[cat.type];
            // 전체 대비 비율 계산 (최대 100%)
            const percent = stats.total === 0 ? 0 : (count / stats.total) * 100;
            
            return (
              <div key={cat.type} className="category-row">
                <span className="cat-icon">{cat.icon}</span>
                <div className="progress-bg">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${percent}%`, 
                      background: cat.color
                    }}
                  />
                </div>
                <span className="cat-count">{count}</span>
              </div>
            );
          })
        )}
      </div>

      {/* 하단 닫기 버튼 */}
      <button 
        className="primary-btn" 
        style={{marginTop: '30px', background:'#555'}} 
        onClick={() => navigate('/')}
      >
        숲으로 돌아가기
      </button>
    </div>
  );
}

export default MyPage;