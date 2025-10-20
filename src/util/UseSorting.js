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
    case "likesDesc":
      refArr.value.sort((a, b) => {
        return b.likes - a.likes;
      });
      break;
    case "likesAsc":
      refArr.value.sort((a, b) => {
        return a.likes - b.likes;
      });
      break;
    case "retweets":
    case "retweetsDesc":
      refArr.value.sort((a, b) => {
        return b.retweets - a.retweets;
      });
      break;
    case "retweetsAsc":
      refArr.value.sort((a, b) => {
        return a.retweets - b.retweets;
      });
      break;
  }
}

export function useSort() {
  return ["dateDesc", "dateAsc", "likes", "retweets"];
}
