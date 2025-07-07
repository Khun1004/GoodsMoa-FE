import { FaHeart } from "react-icons/fa";

const LikeButton = ({ postId, liked, handleLike }) => {
    // liked는 이미 boolean 값으로 전달됨
    const isLiked = !!liked;

    return (
        <button
            className={`sale-like-button ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                handleLike(postId);
            }}
        >
            <FaHeart size={18} color={isLiked ? 'red' : 'gray'} />
        </button>
    );
};
export default LikeButton;
