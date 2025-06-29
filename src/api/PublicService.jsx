import api from "./api";

export const getBestsellerByType = (type) => {
    return api
        .get("/bestseller", { params: { type } })
        .then((res) => res.data)
        .catch((err) => {
            console.error("❌ 베스트셀러 조회 실패:", err);
            throw err;
        });
};

/**
 * 📘 게시판별 검색 API (엔드포인트도 동적으로 받을 수 있음)
 * - path: "/product" | "/demand" | "/trade" | "/search"
 * - board_type: DEMAND | TRADE | PRODUCT (없으면 전체 통합 검색)
 * - search_type: TITLE, DESCRIPTION, HASHTAG, ALL
 * - query: 검색 키워드
 * - category: 카테고리 ID (선택)
 * - order_by: likes / views / close / old / new
 * - include_expired / include_scheduled: 마감/예정 포함 여부
 * - page / page_size: 페이징
 */
// 📁 api/publicService.js (또는 어디든 상관 X)
export const searchBoardPosts = ({
                                     path = "/search",
                                     board_type = null,
                                     search_type = "ALL",
                                     query = "",
                                     category = 0,
                                     order_by = "new",
                                     include_expired = false,
                                     include_scheduled = false,
                                     page = 0,
                                     page_size = 20,
                                 } = {}) => {
    const params = {
        search_type,
        query,
        category,
        order_by,
        include_expired,
        include_scheduled,
        page,
        page_size,
    };

    if (board_type) {
        params.board_type = board_type;
    }

    // ✅ 핵심: path를 써야 /product, /demand로도 나감
    return api
        .get(path, { params })
        .then((res) => res.data)
        .catch((err) => {
            console.error(`❌ 게시글 검색 실패 [${path}]:`, err);
            throw err;
        });
};
