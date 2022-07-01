import searchApi from "youtube-search-api";

async function GetPlaylist(id: string) {
    const result = await searchApi.GetPlaylistData(id, 100);
    return result.items.map((item) => {
        return {
            name: item.title,
            id: item.id,
        };
    });
}

export default GetPlaylist;
