# MultiSourcePlayList
Website where you can add tracks from Youtube, Spotify and from your computer


Install guide
1. Install latest dotnet core
2. Install latest node
3. run "dotnet restore"
4. check sqlite addresses from config.json
4. dotnet ef migrations add firstMigration
5. dotnet ef database update
6. run "npm install"
7. run "npm start"
8. navigate to localhost:8080

Features:
1. Spotify
    1. Search
    2. Play track on active spotify device which support Spotify Connect
        a. This doesn't support yet device selection
    3. Browse spotify artists and albums
    4. Load current spotify users Spotify playlists
        a. User can add whole playlist to local playlist at once
    5. Seek to position
    6. Change spotify user
    7. User must have Spotify premium to use spotify with this application
2. Youtube
    1. Search
    2. Play (video is hidden only video sound is heard)
3. Custom playlists
    1. Create playlist which contains tracks from spotify and youtube (later mp3 also)
    2. Shuffle playlist
    3. Rename playlist
    4. Order playlist by drag and drop
    5. Remove track from playlist
4. MusixMatch
    1. Find lyrics. (find also lyrics for youtube videos if youtube video name is "artisname - trackname" )
5. Authentication
    1. Login
    2. Register
    3. Remember me