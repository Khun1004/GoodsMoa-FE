import React from 'react';
import { ShoppingBag } from 'lucide-react';
import './ManagementComponents.css';

// 로딩 스피너
const LoadingSpinner = () => (
    <div className="loading-container">
        <div className="loading-spinner"></div>
    </div>
);

// 에러 메시지
const ErrorMessage = ({ message }) => (
    <div className="error-container">
        <p>오류: {message}</p>
    </div>
);

// 빈 상태 컴포넌트
const EmptyState = ({ title, description, buttonText, onButtonClick }) => (
    <div className="empty-state-container">
        <div className="empty-state-icon"><ShoppingBag /></div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
        <button className="btn-primary" onClick={onButtonClick}>
            {buttonText}
        </button>
    </div>
);

// 페이지 레이아웃
const ManagementPageLayout = ({
    pageTitle,
    isLoading,
    error,
    data,
    emptyStateProps,
    children
}) => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="management-container">
            <header className="management-header">
                <h1 className="management-title">{pageTitle}</h1>
            </header>
            <main>
                {data.length === 0 ? (
                    <EmptyState {...emptyStateProps} />
                ) : (
                    children
                )}
            </main>
        </div>
    );
};

export default ManagementPageLayout;