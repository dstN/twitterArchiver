export function useSorting(sort, refArr) {
    switch (sort) {
        case "dateDesc":
            refArr.value.sort((a, b) => {
                return b.created_at - a.created_at;
            });
            break;
        case "dateAsc":
            refArr.value.sort((a, b) => {
                return a.created_at - b.created_at;
            });
            break;
        case "likes":
            refArr.value.sort((a, b) => {
                return b.likes - a.likes;
            });
            break;
        case "retweets":
            refArr.value.sort((a, b) => {
                return b.retweets - a.retweets;
            });
            break;
    }
}

export function useSort() {
    return [
        "dateDesc",
        "dateAsc",
        "likes",
        "retweets"
    ]
}