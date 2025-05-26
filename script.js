console.log("welcome to js!");

const songList = document.querySelector(".songList");
let currSong = new Audio();
let currFolder = "songs";
let base = 'https://github.com/pa45h/VibeStream/tree/main/songs';
let songsUrl;
const cardContainer = document.querySelector(".card_container");

async function getSongsUrl(folder) {
  try {
    console.log("getSongsUrl() Called..");
    currFolder = folder;
    const response = await fetch(
      `${base}/${folder}`
    );

    if (!response.ok) {
      throw new Error(response.status);
    }

    const htmlText = await response.text();

    const div = document.createElement("div");
    div.innerHTML = htmlText;

    let songsUrl = [];

    const as = div.querySelectorAll("a");

    for (const element of as) {
      if (element.href.endsWith(".mp3")) {
        songsUrl.push(element.href.split(`/${folder}/`)[1]);
      }
    }

    return songsUrl;
  } catch (error) {
    console.log(error);
  }
}

const playMusic = (song, movie) => {
  console.log("playMusic() called..");

  currSong.src =
    `${base}/${currFolder}/` +
    song +
    "-" +
    movie +
    ".mp3";

  currSong.play();

  play_button.src = "./imgs/pause.svg";

  currentSong_name.innerHTML = `${song}`;

  document.querySelector(".song_info").style.display = "flex";

  selectSong.style.opacity = "0";

  document.querySelector(".playing_songs").style.display = "flex";

  document.querySelector(".volume_bar").style.display = "flex";

  console.log(`Playing ${song}-${movie}`);
};

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function listDownAlbumSongs(currFolder) {
  songsUrl = await getSongsUrl(`${encodeURI(`${currFolder}`)}`);
  songList.innerHTML = "";
  for (const song of songsUrl) {
    songList.innerHTML += `
        <li class="songItems flex">

          <div class="songItems_info flex">
            <img class="music_logo" src="./imgs/music.svg" alt="music">
            <div>                                
              <h3>${song.split("-")[0].replaceAll("%20", " ")}</h3>
                <p>${song
                  .split("-")[1]
                  .replaceAll("%20", " ")
                  .replaceAll(".mp3", "")}</p>
            </div>
          </div>
          <div class="plaNow flex">
            <div>Play now</div>
              <img src="./imgs/play.svg" alt="play">
          </div>
                    
        </li>
        `;
  }

  return songsUrl;
}

async function listDownAlbums(currFolder) {
  console.log(cardContainer);
  console.log(currFolder);
  try {
    const response = await fetch(
      `${base}/${currFolder}`
    );
    const responseText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = responseText;
    const as = div.querySelectorAll("a");
    let albumsUrl = [];

    for (const a of as) {
      if (a.href.includes("/songs/") && !a.href.endsWith(".mp3")) {
        albumsUrl.push(a.href);
      }
    }
    console.log(albumsUrl);
    for (const album of albumsUrl) {
      const albumSongsRes = await fetch(album);
      const albumSongsText = await albumSongsRes.text();
      const div = document.createElement("div");
      div.innerHTML = albumSongsText;
      const as = div.getElementsByTagName("a");
      let albumSongs = [];
      for (const a of as) {
        if (a.href.includes(album) && a.href.endsWith(".mp3")) {
          albumSongs.push(a.href);
        }
      }

      cardContainer.innerHTML += `
      <div class="card">
        <div class="play">
          <img src="./imgs/play.png" alt="play">
        </div>
        <img src="${album}/cover.jpg" alt="card">
        <h2>${album.split("/")[4].replaceAll("%20", " ")}</h2>
        <p>${albumSongs.length} Songs</p>
      </div>
      `;
    }
  } catch (err) {
    console.log(err);
  }
}

function getPlaySongMovieName() {
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      const songName = e.getElementsByTagName("h3")[0].innerHTML;
      const movieName = e.getElementsByTagName("p")[0].innerHTML;
      playMusic(songName, movieName);
    });
  });
}

async function main() {
  songsUrl = await listDownAlbumSongs(currFolder);
  await listDownAlbums(currFolder);
  getPlaySongMovieName();

  play_button.addEventListener("click", () => {
    console.log("Play Button Clicked..");

    if (!currSong.src) {
      play_button.src = "./imgs/play.svg";
    } else {
      if (currSong.paused) {
        currSong.play();
        console.log("Played Current Song");
        play_button.src = "./imgs/pause.svg";
      } else {
        currSong.pause();
        play_button.src = "./imgs/play.svg";
        console.log("Paused Current Song");
      }
    }
  });

  currSong.addEventListener("timeupdate", () => {
    song_time.innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)}`;
    song_duration.innerHTML = `${secondsToMinutesSeconds(currSong.duration)}`;

    document.querySelector(".seekbar_range").value =
      (currSong.currentTime / currSong.duration) * 100;
  });

  document.querySelector(".seekbar_range").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".seekbar_range").value = `${percent}`;

    currSong.currentTime = (currSong.duration * percent) / 100;
  });

  hamburger.addEventListener("click", () => {
    console.log("Hamburger Clicked..");
    document.querySelector(".left").style.left = 0;
    document.querySelector(".close").style.display = "inline";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous_button.addEventListener("click", () => {
    console.log("previous_button clicked..");
    let indexOfCurrSong = songsUrl.indexOf(
      currSong.src.split("/").slice(-1)[0]
    );

    if (indexOfCurrSong === 0) {
      indexOfCurrSong = songsUrl.length - 1;
    } else {
      indexOfCurrSong--;
    }

    const songName = `${songsUrl[indexOfCurrSong]
      .split("-")[0]
      .replaceAll("%20", " ")}`;
    const movieName = `${songsUrl[indexOfCurrSong]
      .split("-")[1]
      .replaceAll("%20", " ")
      .replaceAll(".mp3", "")}`;
    console.log("Playing ", songName, movieName);

    playMusic(songName, movieName);
  });

  next_button.addEventListener("click", () => {
    console.log("next_button clicked..");
    let indexOfCurrSong = songsUrl.indexOf(
      currSong.src.split("/").slice(-1)[0]
    );

    if (indexOfCurrSong === songsUrl.length - 1) {
      indexOfCurrSong = 0;
    } else {
      indexOfCurrSong++;
    }

    const songName = `${songsUrl[indexOfCurrSong]
      .split("-")[0]
      .replaceAll("%20", " ")}`;
    const movieName = `${songsUrl[indexOfCurrSong]
      .split("-")[1]
      .replaceAll("%20", " ")
      .replaceAll(".mp3", "")}`;
    console.log("Playing ", songName, movieName);

    playMusic(songName, movieName);
  });

  volume_range.addEventListener("input", (e) => {
    currSong.volume = e.target.value / 100;
  });

  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    card.addEventListener("click", async () => {
      console.log("Album Clicked..");

      const cardH2 = card.getElementsByTagName("h2");
      currFolder = `songs/${cardH2[0].innerHTML}`;

      document.querySelector(".left").style.left = 0;
      document.querySelector(".close").style.display = "inline";

      songsUrl = await listDownAlbumSongs(currFolder);
      getPlaySongMovieName();
    });

    card.querySelector(".play").addEventListener("click", async () => {
      console.log("Album Played..");

      const cardH2 = card.getElementsByTagName("h2");
      currFolder = `songs/${cardH2[0].innerHTML}`;

      songsUrl = await listDownAlbumSongs(currFolder);

      const fisrtSongOfAlbum = songsUrl[0].split("-")[0].replaceAll("%20", " ");

      playMusic(fisrtSongOfAlbum, ` ${cardH2[0].innerHTML}`);
    });
  });

  library_list.addEventListener("click", async () => {
    currFolder = "songs";
    songsUrl = await listDownAlbumSongs(currFolder);
    getPlaySongMovieName();
  });

  search_input.addEventListener("input", (e) => {
    let search = e.target.value.trim().toLowerCase();

    const songItems = document.querySelectorAll(".songList li");

    songItems.forEach((song) => {
      let songLi = song;
      song = song.innerText.trim().toLowerCase().replaceAll("play now", "");

      if (song.includes(search)) {
        songLi.style.display = "";
      } else {
        songLi.style.display = "none";
      }
    });

    const albums = document.querySelectorAll(".card");

    albums.forEach((album) => {
      let albumElement = album;
      let albumTitle = album
        .getElementsByTagName("h2")[0]
        .innerHTML.toLowerCase();

      if (albumTitle.includes(search)) {
        albumElement.style.display = "";
      } else {
        albumElement.style.display = "none";
      }
    });

    document.querySelector(".home ul li").addEventListener("click", () => {
      search_input.value = "";
      songItems.forEach((li) => {
        li.style.display = "";
      });
      albums.forEach((album) => {
        album.style.display = "";
      });
    });
  });
}

main();
