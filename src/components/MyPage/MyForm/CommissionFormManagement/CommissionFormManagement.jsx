import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import api from "../../../../api/api";
import ManagementPageLayout from "../../../public/management/ManagementPageLayout";
import ManagementCard from "../../../public/management/ManagementCard";
import ActionButton from "../../../public/management/ActionButton";
import Pagination from "../../../public/management/Pagination";
import SectionCard from "../../../public/management/SectionCard";

const CommissionFormManagement = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    const fetchCommissions = async (currentPage) => {
        try {
            setLoading(true);
            const res = await api.get('/commission/post', {
                params: {
                    page: currentPage,
                    size: 10,
                },
            });
            setCommissions(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "커미션 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions(page);
    }, [page]);

    const handleDelete = async (id) => {
        if (!window.confirm("정말로 이 커미션을 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/commission/post-delete/${id}`);
            fetchCommissions(page);
        } catch (err) {
            alert(err.response?.data?.message || "삭제 중 오류가 발생했습니다.");
        }
    };

    // 수정 버튼
    const handleEdit = (commission) => {
        navigate("/commissionForm", {
            state: {
                id: commission.id,
                from: "management"
            }
        });
    };

    // 상세 조회
    const handleCardClick = (item) => {
        navigate(`/commissionDetail/${item.id}`, {
            state: { id: item.id },
        });
    };

    return (
        <ManagementPageLayout
            pageTitle="내가 등록한 커미션 관리"
            isLoading={loading}
            error={error}
            data={commissions}
            emptyStateProps={{
                title: "등록된 커미션이 없습니다",
                description: "커미션을 등록하고 의뢰를 받아보세요.",
                buttonText: "커미션 등록하기",
                onButtonClick: () => navigate("/commissionForm"),
            }}
        >
            <SectionCard title="커미션 목록" icon={<User size={20} />}>
                <div className="management-grid">
                    {commissions.map((commission) => (
                        <ManagementCard
                            key={commission.id}
                            item={commission}
                            statusType="public"
                            statusText="공개"
                            badges={[
                                { icon: null, text: `조회수 ${commission.views}` },
                                ...commission.hashtag?.split(",").map(tag => ({ icon: null, text: `#${tag.trim()}` })) || []
                            ]}
                            footerText={`작성자: ${commission.userName}`}
                            onCardClick={handleCardClick}
                            actionButtons={
                                <>
                                    <ActionButton
                                        variant="edit"
                                        onClick={() => handleEdit(commission)}
                                    >
                                        수정
                                    </ActionButton>
                                    <ActionButton
                                        variant="delete"
                                        onClick={() => handleDelete(commission.id)}
                                    >
                                        삭제
                                    </ActionButton>
                                </>
                            }
                        />
                    ))}
                </div>
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </SectionCard>
        </ManagementPageLayout>
    );
};

export default CommissionFormManagement;
