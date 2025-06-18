import { FaHeart } from "react-icons/fa";

const LikeButton = ({ postId, liked, handleLike }) => {
    const isLiked = liked[String(postId)];

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
