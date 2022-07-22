import searchApi from "youtube-search-api";
import Music from "./Music";

async function GetPlaylist(id: string): Promise<Music[]> {
    const result = await searchApi.GetPlaylistData(id, 100);
    return result.items.map((item) => {
        return new Music(item.title, item.id);
    });
}

export default GetPlaylist;
