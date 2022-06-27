const searchApi = require("youtube-search-api");

async function GetPlaylist(id) {
    const result = await searchApi.GetPlaylistData(id, 100);
    return result.items.map(item => {
        return {
            name: item.title,
            id: item.id
        };
    });
}

module.exports.GetPlaylist = GetPlaylist;