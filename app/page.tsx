'use client';

import { useEffect, useState } from 'react';

const CLIENT_ID = 'a067cc8ebdf04430953941abfcb573b4'; // Spotify Developer Dashboard'dan alın
const REDIRECT_URI = 'https://spotfiy-app.vercel.app/';
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const SCOPES = 'user-read-currently-playing';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // URL'deki access_token'i al ve state'e ata
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash
        .substring(1)
        .split('&')
        .find((item) => item.startsWith('access_token'))
        ?.split('=')[1];
      if (token) {
        setAccessToken(token);
        window.location.hash = ''; // URL hash'ini temizle
      }
    }
  }, []);

  // Kullanıcıyı Spotify girişine yönlendir
  const loginToSpotify = () => {
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  };

  // Spotify'dan şu an çalan şarkıyı al
  const fetchCurrentlyPlaying = async () => {
    if (!accessToken) {
      setError('You need to log in first.');
      return;
    }

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 204) {
        setError('No track is currently playing.');
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setCurrentlyPlaying(data.item);
        setError(null);
      } else {
        setError('Error fetching currently playing track');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-6 min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } transition-colors duration-300`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-4 right-4 px-3 py-1 rounded ${
          darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-300 text-gray-800'
        }`}
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <h1 className="text-3xl font-bold mb-6">Spotify Now Playing</h1>
      {!accessToken ? (
        <button
          onClick={loginToSpotify}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Log in with Spotify
        </button>
      ) : (
        <button
          onClick={fetchCurrentlyPlaying}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Get Current Track
        </button>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {currentlyPlaying && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded p-6 w-full max-w-sm mt-6">
          <img
            src={currentlyPlaying.album.images[0].url}
            alt={currentlyPlaying.name}
            className="rounded mb-4"
          />
          <h2 className="text-xl font-bold">{currentlyPlaying.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            by {currentlyPlaying.artists.map((artist: any) => artist.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
