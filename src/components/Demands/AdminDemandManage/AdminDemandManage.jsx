import { CheckCircle, ChevronDown, ChevronUp, Clock, Download, Filter, Package, Search, Truck, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './AdminDemandManage.css';

const AdminDemandManage = () => {
    const [participations, setParticipations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('전체');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [expandedRow, setExpandedRow] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        completed: 0,
        failed: 0
    });

    // 색상 팔레트
    const COLORS = {
        진행중: '#4F46E5',
        목표달성: '#10B981',
        마감실패: '#EF4444',
        배송준비중: '#F59E0B',
        배송중: '#3B82F6',
        배송완료: '#10B981'
    };

    useEffect(() => {
        // localStorage에서 참여 데이터 가져오기
        const savedParticipations = JSON.parse(localStorage.getItem('participations')) || [];
        
        // 더미 데이터 (실제로는 API에서 가져옵니다)
        const dummyData = [
            {
                id: 1,
                title: "친환경 생활용품 세트",
                thumbnail: "/api/placeholder/80/80",
                status: "목표달성",
                deadline: "2025-05-31",
                progress: 100,
                price: 74500,
                date: "2025-04-20",
                participants: 125,
                deliveryStatus: "배송완료",
                products: [
                    { name: "친환경 수세미", quantity: 1, price: 15000 },
                    { name: "천연 재료 세제", quantity: 2, price: 29800 }
                ]
            },
            // ... 추가 더미 데이터
        ];

        const allData = [...savedParticipations, ...dummyData];
        setParticipations(allData);
        calculateStats(allData);
    }, []);

    const calculateStats = (data) => {
        setStats({
            total: data.length,
            inProgress: data.filter(p => p.status === "진행중").length,
            completed: data.filter(p => p.status === "목표달성").length,
            failed: data.filter(p => p.status === "마감실패").length
        });
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleStatusChange = (id, newStatus) => {
        const updated = participations.map(p => 
            p.id === id ? { ...p, status: newStatus } : p
        );
        setParticipations(updated);
        localStorage.setItem('participations', JSON.stringify(updated));
        calculateStats(updated);
    };

    const handleDeliveryChange = (id, newStatus) => {
        const updated = participations.map(p => 
            p.id === id ? { ...p, deliveryStatus: newStatus } : p
        );
        setParticipations(updated);
        localStorage.setItem('participations', JSON.stringify(updated));
    };

    const sortedData = [...participations].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredData = sortedData.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === '전체' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // 차트 데이터
    const statusData = [
        { name: '진행중', value: stats.inProgress },
        { name: '목표달성', value: stats.completed },
        { name: '마감실패', value: stats.failed }
    ];

    const monthlyData = [
        { name: '1월', 참여수: 12, 달성률: 75 },
        { name: '2월', 참여수: 18, 달성률: 82 },
        { name: '3월', 참여수: 22, 달성률: 91 },
        { name: '4월', 참여수: 15, 달성률: 67 },
        { name: '5월', 참여수: 28, 달성률: 89 }
    ];

    return (
        <div className="admin-demand-container">
            <h1 className="admin-title">수요조사 참여 관리</h1>
            
            {/* 통계 카드 */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>총 참여 건수</h3>
                    <p>{stats.total}</p>
                    <div className="stat-trend up">+12% 지난달 대비</div>
                </div>
                <div className="stat-card">
                    <h3>진행 중</h3>
                    <p>{stats.inProgress}</p>
                    <div className="stat-trend up">+5% 지난달 대비</div>
                </div>
                <div className="stat-card">
                    <h3>목표 달성</h3>
                    <p>{stats.completed}</p>
                    <div className="stat-trend up">+8% 지난달 대비</div>
                </div>
                <div className="stat-card">
                    <h3>마감 실패</h3>
                    <p>{stats.failed}</p>
                    <div className="stat-trend down">-3% 지난달 대비</div>
                </div>
            </div>
            
            {/* 차트 섹션 */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>상태별 분포</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-card">
                    <h3>월별 참여 현황</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="참여수" fill="#4F46E5" name="참여 수" />
                            <Bar yAxisId="right" dataKey="달성률" fill="#10B981" name="달성률 (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* 참여 목록 테이블 */}
            <div className="table-section">
                <div className="table-header">
                    <h2>참여 목록</h2>
                    <div className="table-controls">
                        <div className="search-box">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="검색 (제목 또는 ID)" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-dropdown">
                            <Filter size={18} />
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="전체">전체</option>
                                <option value="진행중">진행중</option>
                                <option value="목표달성">목표달성</option>
                                <option value="마감실패">마감실패</option>
                            </select>
                        </div>
                        <button className="export-btn">
                            <Download size={18} />
                            <span>엑셀 내보내기</span>
                        </button>
                    </div>
                </div>
                
                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>
                                    <div className="th-content">
                                        ID {sortConfig.key === 'id' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('title')}>
                                    <div className="th-content">
                                        제목 {sortConfig.key === 'title' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('date')}>
                                    <div className="th-content">
                                        참여일 {sortConfig.key === 'date' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('deadline')}>
                                    <div className="th-content">
                                        마감일 {sortConfig.key === 'deadline' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('status')}>
                                    <div className="th-content">
                                        상태 {sortConfig.key === 'status' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('progress')}>
                                    <div className="th-content">
                                        달성률 {sortConfig.key === 'progress' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}>
                                        <td>#{item.id}</td>
                                        <td className="title-cell">
                                            <img src={item.thumbnail} alt={item.title} />
                                            <span>{item.title}</span>
                                        </td>
                                        <td>{item.date}</td>
                                        <td>{item.deadline}</td>
                                        <td>
                                            <span className={`status-badge ${item.status}`}>
                                                {item.status === "진행중" && <Clock size={14} />}
                                                {item.status === "목표달성" && <CheckCircle size={14} />}
                                                {item.status === "마감실패" && <XCircle size={14} />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="progress-container">
                                                <div 
                                                    className="progress-bar" 
                                                    style={{ width: `${item.progress}%`, backgroundColor: COLORS[item.status] }}
                                                ></div>
                                                <span>{item.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedRow(expandedRow === item.id ? null : item.id);
                                                }}
                                            >
                                                {expandedRow === item.id ? '접기' : '자세히'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === item.id && (
                                        <tr className="expanded-row">
                                            <td colSpan="7">
                                                <div className="expanded-content">
                                                    <div className="expanded-section">
                                                        <h4>상품 정보</h4>
                                                        <div className="products-list">
                                                            {item.products?.map((product, idx) => (
                                                                <div key={idx} className="product-item">
                                                                    <span>{product.name}</span>
                                                                    <span>{product.quantity}개</span>
                                                                    <span>{product.price.toLocaleString()}원</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="expanded-section">
                                                        <h4>상태 관리</h4>
                                                        <div className="status-controls">
                                                            <div className="status-options">
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        checked={item.status === "진행중"}
                                                                        onChange={() => handleStatusChange(item.id, "진행중")}
                                                                    />
                                                                    <span className="status-option in-progress">
                                                                        <Clock size={16} /> 진행중
                                                                    </span>
                                                                </label>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        checked={item.status === "목표달성"}
                                                                        onChange={() => handleStatusChange(item.id, "목표달성")}
                                                                    />
                                                                    <span className="status-option completed">
                                                                        <CheckCircle size={16} /> 목표달성
                                                                    </span>
                                                                </label>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        checked={item.status === "마감실패"}
                                                                        onChange={() => handleStatusChange(item.id, "마감실패")}
                                                                    />
                                                                    <span className="status-option failed">
                                                                        <XCircle size={16} /> 마감실패
                                                                    </span>
                                                                </label>
                                                            </div>
                                                            
                                                            {item.status === "목표달성" && (
                                                                <div className="delivery-controls">
                                                                    <h5>배송 상태</h5>
                                                                    <div className="delivery-options">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                checked={item.deliveryStatus === "배송준비중"}
                                                                                onChange={() => handleDeliveryChange(item.id, "배송준비중")}
                                                                            />
                                                                            <span className="delivery-option preparing">
                                                                                <Package size={16} /> 배송준비중
                                                                            </span>
                                                                        </label>
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                checked={item.deliveryStatus === "배송중"}
                                                                                onChange={() => handleDeliveryChange(item.id, "배송중")}
                                                                            />
                                                                            <span className="delivery-option in-progress">
                                                                                <Truck size={16} /> 배송중
                                                                            </span>
                                                                        </label>
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                checked={item.deliveryStatus === "배송완료"}
                                                                                onChange={() => handleDeliveryChange(item.id, "배송완료")}
                                                                            />
                                                                            <span className="delivery-option completed">
                                                                                <CheckCircle size={16} /> 배송완료
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="expanded-section">
                                                        <h4>참여자 정보</h4>
                                                        <p>총 {item.participants || 0}명 참여</p>
                                                        <button className="view-participants-btn">
                                                            참여자 목록 보기
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredData.length === 0 && (
                        <div className="no-results">
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDemandManage;