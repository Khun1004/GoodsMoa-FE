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
