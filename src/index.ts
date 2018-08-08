import { google, youtube_v3 } from 'googleapis'
import { Video, Channel, Playlist } from './entities'
import { parseUrl } from './util'
import axios from 'axios'
export * from './entities'

const youtube = google.youtube('v3')

/**
 * The main class used to interact with the YouTube API. Use this.
 */
export class YouTube {
  public token: string

  /**
   *
   * @param token Your YouTube Data API v3 token. Don't share this with anybody.
   */
  constructor (token: string) {
    this.token = token
  }

  /**
   * Search videos on YouTube.
   * @param searchTerm What to search for on YouTube.
   * @param maxResults The maximum amount of results to find. Defaults to 10.
   */
  public async searchVideos (searchTerm: string, maxResults: number = 10) {
    if (maxResults < 1 || maxResults > 50) {
      return Promise.reject('Max results must be greater than 0 and less or equal to 50.')
    }

    const { data: results } = await youtube.search.list({
      q: searchTerm,
      maxResults,
      auth: this.token,
      part: 'snippet',
      type: 'video'
    })

    if (maxResults === 1) {
      return new Video(this, results.items[0])
    }

    let videos: Video[] = []

    for (let i = 0; i < results.items.length; i++) {
      videos.push(new Video(this, results.items[i]))
    }

    return videos
  }

  /**
   * Get a video object from the ID of a video.
   * @param id The ID of the video.
   */
  public async getVideo (id: string) {
    const { data: video } = await youtube.videos.list({
      id,
      part: 'snippet,contentDetails',
      auth: this.token
    })

    if (video.items.length === 0) {
      return Promise.reject('Video not found.')
    }

    return new Video(this, video.items[0])
  }

  /**
   * Get a video object from the url of a video.
   * @param url The url of the video.
   */
  public async getVideoByUrl (url: string) {
    const id = parseUrl(url)

    if (!id.video) {
      return Promise.reject('Not a valid video url.')
    }

    const { data: video } = await youtube.videos.list({
      id: id.video,
      part: 'snippet,contentDetails',
      auth: this.token
    })

    if (video.items.length === 0) {
      return Promise.reject('Video not found.')
    }

    return new Video(this, video.items[0])
  }

  /**
   * Search channels on YouTube.
   * @param searchTerm What to search for on YouTube.
   * @param maxResults The maximum amount of results to find. Defaults to 10.
   */
  public async searchChannels (searchTerm: string, maxResults: number = 10) {
    if (maxResults < 1 || maxResults > 50) {
      return Promise.reject('Max results must be greater than 0 and less or equal to 50.')
    }

    const { data: results } = await youtube.search.list({
      q: searchTerm,
      maxResults,
      auth: this.token,
      part: 'snippet',
      type: 'channel'
    })

    if (maxResults === 1) {
      return new Channel(this, results.items[0])
    }

    let channels: Channel[] = []

    for (let i = 0; i < results.items.length; i++) {
      channels.push(new Channel(this, results.items[i]))
    }

    return channels
  }

  /**
   * Get a channel object from the ID of a channel.
   * @param id The url of the channel.
   */
  public async getChannel (id: string) {
    const { data: channel } = await youtube.channels.list({
      id,
      part: 'snippet,statistics,status,contentDetails',
      auth: this.token
    })

    if (channel.items.length === 0) {
      return Promise.reject('Channel not found.')
    }

    return new Channel(this, channel.items[0])
  }

  /**
   * Get a channel object from the url of a channel.
   * @param url The url of the channel.
   */
  public async getChannelByUrl (url: string) {
    const id = parseUrl(url)

    if (!id.channel) {
      return Promise.reject('Not a valid channel url.')
    }

    const { data: channel } = await youtube.channels.list({
      id: id.channel,
      part: 'snippet,statistics,status,contentDetails',
      auth: this.token
    })

    if (channel.items.length === 0) {
      return Promise.reject('Channel not found.')
    }

    return new Channel(this, channel.items[0])
  }

  /**
   * Gets the 50 latest videos from a channel.
   * @param id The ID of the channel.
   */
  public async getChannelVideos (id: string) {
    let videos: Video[] = []
    const { data: results } = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${id}&order=date&key=${this.token}&maxResults=50`)

    if (results.items.length === 0) {
      return Promise.reject('Channel not found/has no videos.')
    }

    for (let i = 0; i < results.items.length; i++) {
      videos.push(new Video(this, results.items[i]))
    }

    return videos
  }

  /**
   * Get a playlist object from the ID of a playlist.
   * @param id The url of the playlist.
   */
  public async getPlaylist (id: string) {
    const { data: playlist } = await youtube.playlists.list({
      id,
      part: 'snippet,contentDetails,player',
      auth: this.token
    })

    if (playlist.items.length === 0) {
      return Promise.reject('Playlist not found.')
    }

    return new Playlist(this, playlist.items[0])
  }

  /**
   * Get a playlist object from the url of a playlist.
   * @param url The url of the playlist.
   */
  public async getPlaylistByUrl (url: string) {
    const id = parseUrl(url)

    if (!id.playlist) {
      return Promise.reject('Not a valid playlist url.')
    }

    const { data: playlist } = await youtube.playlists.list({
      id: id.playlist,
      part: 'snippet,contentDetails,player',
      auth: this.token
    })

    if (playlist.items.length === 0) {
      return Promise.reject('Playlist not found.')
    }

    return new Playlist(this, playlist.items[0])
  }

  /**
   * Search playlists on YouTube.
   * @param searchTerm What to search for on YouTube.
   * @param maxResults The maximum amount of results to find. Defaults to 10.
   */
  public async searchPlaylists (searchTerm: string, maxResults: number = 10) {
    if (maxResults > 50 || maxResults < 1) {
      return Promise.reject('Max results must be 50 or below, and greater than 0.')
    }

    const { data: results } = await youtube.search.list({
      q: searchTerm,
      maxResults,
      type: 'playlist',
      part: 'snippet',
      auth: this.token
    })

    if (maxResults === 1) {
      return new Playlist(this, results.items[0])
    }

    let playlists: Playlist[] = []

    for (let i = 0; i < results.items.length; i++) {
      playlists.push(new Playlist(this, results.items[i]))
    }

    return playlists
  }

  /**
   * Get `maxResults` videos in a playlist. Used mostly internally with `Playlist#getVideos`.
   * If <= 0 or not included, returns all videos in the playlist.
   * @param playlistId The ID of the playlist.
   * @param maxResults The maximum amount of videos to get from the playlist.
   */
  public async getPlaylistItems (playlistId: string, maxResults: number = -1) {
    let full
    let videos: Video[] = []

    if (maxResults <= 0) {
      full = true
    } else {
      full = false
    }

    if (maxResults > 50) {
      return Promise.reject('Max results must be 50 or below.')
    }

    let { data: results } = await youtube.playlistItems.list({
      playlistId,
      part: 'snippet',
      auth: this.token,
      maxResults: full ? 50 : maxResults
    })

    if (results.items.length === 0) {
      return Promise.reject('Playlist not found.')
    }

    const totalResults = results.pageInfo.totalResults
    const perPage = 50
    const pages = Math.floor(totalResults / perPage)

    results.items.forEach(item => {
      videos.push(new Video(this, item))
    })

    if (!full || pages === 0) {
      return videos
    }

    let oldRes: youtube_v3.Schema$PlaylistItemListResponse = results

    for (let i = 0; i < pages; i++) {
      const { data: newResults } = await youtube.playlistItems.list({
        playlistId,
        part: 'snippet',
        auth: this.token,
        maxResults: 50,
        pageToken: oldRes.nextPageToken
      })

      oldRes = newResults
      newResults.items.forEach((item) => {
        videos.push(new Video(this, item))
      })
    }

    return videos
  }
}
