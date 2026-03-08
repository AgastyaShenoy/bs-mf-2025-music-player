
import React, { useState, useEffect, useCallback, useRef } from 'react';

const INITIAL_TRACKS = {
  game: [
    { id: 'g1', name: 'Retaliation', url: '/audio/Iframe Retaliation [KffBSg-X0j4].mp3', selected: true },
    { id: 'g2', name: 'Pre Game', url: '/audio/Iframe Pregame [u8vaSkiwKfw].mp3', selected: true },
    { id: 'g3', name: 'Army Strong', url: '/audio/Iframe Army Strong [WHutEizB5B4].mp3', selected: true },
    { id: 'g4', name: 'Jiggy Wit It', url: '/audio/Iframe Jiggy Wit It [AsFs1rtDTt8].mp3', selected: true },
  ],
  set: [
    { id: 's1', name: 'Bull Rush', url: '/audio/Iframe Bull Rush [9HBFLAR2fuw].mp3', selected: true },
    { id: 's2', name: 'Vertex', url: '/audio/Iframe Vertex [hb9_s5g6vPs].mp3', selected: true },
    { id: 's3', name: 'NYPD Undercover', url: '/audio/Iframe NYPD Undercover [jY9McktM0Qs].mp3', selected: true },
    { id: 's4', name: 'Kick Six', url: '/audio/Iframe Kick Six [YDVTXLxMggA].mp3', selected: true },
  ],
  match: [
    { id: 'm1', name: 'Stronger', url: '/audio/Iframe Stronger [OVFb338Pv5U].mp3', selected: true },
    { id: 'm2', name: 'At All Costs', url: '/audio/Iframe At All Costs [tIQPUhEpsD8].mp3', selected: true },
    { id: 'm3', name: 'Faut Level Up', url: '/audio/Iframe Faut Level Up [LTdnD0k1_UY].mp3', selected: true },
    { id: 'm4', name: 'NYPD Undercover', url: '/audio/Iframe NYPD Undercover [jY9McktM0Qs].mp3', selected: true },
    { id: 'm5', name: 'Entrapment', url: '/audio/Iframe Entrapment [nS5UZRUet4c].mp3', selected: true },
    { id: 'm6', name: 'Kick Six', url: '/audio/Iframe Kick Six [YDVTXLxMggA].mp3', selected: true },
  ],
  generic: [
    { id: 'gen1', name: 'Design of the time', url: '/audio/Iframe Design Of The Times [Ix32qfWyrDM].mp3', selected: true },
    { id: 'gen2', name: 'Push the Envelope', url: '/audio/Soundloaders.app - Push The Envelope - Instrumental - Clerkenwell Sound Collective.mp3', selected: true },
    { id: 'gen3', name: 'The Bombay', url: '/audio/Iframe The Bombay [_BVEtTv-pd4].mp3', selected: true },
  ],
  draft: [
    { id: 'dr1', name: 'Operation Crysis', url: '/audio/Iframe Operation Crisis [JgARoq3-Zo4].mp3', selected: true },
    { id: 'dr2', name: 'Impossible Decision', url: '/audio/Iframe Impossible Decision [tRZz2jGpTiE].mp3', selected: true },
    { id: 'dr3', name: 'Fractured Reality', url: '/audio/Iframe Fractured Reality [hs0-vF0Ijsw].mp3', selected: true },
  ],
};

const INITIAL_SHORTCUTS = {
  game: 'g',
  set: 's',
  match: 'm',
  generic: 'a',
  draft: 'd',
};

function App() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [shortcuts, setShortcuts] = useState(INITIAL_SHORTCUTS);
  const [volume, setVolume] = useState(0.5);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => { setIsPlaying(false); setActiveCategory(null); };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playRandomTrack = useCallback((category) => {
    let availableTracks = [];

    if (category === 'setMatch') {
      availableTracks = [
        ...tracks.set.filter(t => t.selected),
        ...tracks.match.filter(t => t.selected)
      ];
    } else {
      availableTracks = tracks[category].filter(t => t.selected);
    }

    if (availableTracks.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const track = availableTracks[randomIndex];

    audioRef.current.src = track.url;
    audioRef.current.loop = category === 'generic' || category === 'draft';
    audioRef.current.play().catch(e => console.error("Audio playback failed:", e));

    setActiveCategory(category);
    setTimeout(() => setActiveCategory(null), 1000);
  }, [tracks]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current.src || audioRef.current.src.endsWith(window.location.host + '/')) { // Check if empty or just root url
      setShowWarning(true);
      return;
    }
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    } else {
      audioRef.current.pause();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      if (key === shortcuts.game) playRandomTrack('game');
      if (key === shortcuts.set) playRandomTrack('set');
      if (key === shortcuts.match) playRandomTrack('match');
      if (key === 'c') playRandomTrack('setMatch'); // Hardcode 'c' for combined for now
      if (key === shortcuts.generic) playRandomTrack('generic');
      if (key === shortcuts.draft) playRandomTrack('draft');
      if (key === ' ' || key === 'escape') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, playRandomTrack, togglePlayPause]);

  const toggleTrack = (category, id) => {
    setTracks(prev => ({
      ...prev,
      [category]: prev[category].map(t =>
        t.id === id ? { ...t, selected: !t.selected } : t
      )
    }));
  };

  const updateShortcut = (category, key) => {
    setShortcuts(prev => ({ ...prev, [category]: key.toLowerCase() }));
  };

  return (
    <div className="brawl-card">
      <h1 style={{ fontSize: '3.5rem' }}>MONTHLY FINALS 2025</h1>

      <div className="volume-container">
        <button
          className="mute-btn"
          onClick={() => {
            if (volume > 0) {
              setPreviousVolume(volume);
              setVolume(0);
            } else {
              setVolume(previousVolume > 0 ? previousVolume : 0.5);
            }
          }}
          title="Mute/Unmute"
        >
          {volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔇'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--bs-green) ${volume * 100}%, #0b0d17 ${volume * 100}%)`
          }}
        />
        <span style={{ minWidth: '60px', textAlign: 'right' }}>{Math.round(volume * 100)}%</span>
      </div>

      <div className="trigger-grid">
        {['game', 'set', 'setMatch', 'match', 'generic', 'draft'].map(cat => (
          <button
            key={cat}
            className={`trigger-button ${cat} ${activeCategory === cat ? 'active playing' : ''}`}
            onClick={() => playRandomTrack(cat)}
          >
            <span className="label">
              {cat === 'setMatch' ? 'SET/MATCH' : cat.toUpperCase()}
              {['game', 'set', 'match'].includes(cat) ? ' Win' : ''}
            </span>
            <span className="shortcut">{cat === 'setMatch' ? 'C' : shortcuts[cat]?.toUpperCase()}</span>
          </button>
        ))}
      </div>

      <div className="action-button-container">
        <button className="pause-btn" onClick={togglePlayPause}>
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
      </div>

      <div className="track-management">
        {/* ... track lists ... */}
        {Object.keys(tracks).map(category => (
          <div key={category} className="section-card">
            <div className="section-header">
              <h3>{category.toUpperCase()}{['game', 'set', 'match'].includes(category) ? ' WIN' : ''}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem' }}>KEY:</span>
                <input
                  type="text"
                  className="shortcut-input"
                  value={shortcuts[category]}
                  maxLength="1"
                  onChange={(e) => updateShortcut(category, e.target.value)}
                />
              </div>
            </div>
            <div className="track-list">
              {tracks[category].map(track => (
                <div
                  key={track.id}
                  className={`track-pill ${track.selected ? 'selected' : ''}`}
                  onClick={() => toggleTrack(category, track.id)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{track.selected ? '✔' : '○'}</span>
                  {track.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="info-panel">
        <h3>HOW TO USE</h3>
        <p>Press the massive buttons or use the hotkeys to instantly play a random banger from that category.</p>
        <p>Need a massive pop-off? Hit <strong>SET/MATCH</strong> to pool both lists together!</p>
        <p>Uncheck tracks in the list below to remove them from the randomizer pool.</p>
        <a href="https://www.youtube.com/watch?v=BAdwDpts5_4&t=2179s" target="_blank" rel="noopener noreferrer" className="yt-link">
          📺 WATCH THE ORIGINAL VIDEO
        </a>
      </div>

      <div className="footer-info">
        HOTKEYS: {Object.values(shortcuts).join(' • ').toUpperCase()} • C (SET/MATCH) • SPACE TO PLAY/PAUSE
      </div>

      <a href="https://www.youtube.com/@Aga2522BrawlStars" target="_blank" rel="noopener noreferrer" className="creator-watermark">
        Created by Aga2522
      </a>

      {showWarning && (
        <div className="warning-overlay" onClick={() => setShowWarning(false)}>
          <div className="warning-modal" onClick={e => e.stopPropagation()}>
            <h2>⚠️ HOLD UP! ⚠️</h2>
            <p>You haven't picked a track yet!</p>
            <p>Hit one of the big event buttons (like GAME WIN) or press its hotkey to start playing before you can pause/play.</p>
            <div style={{ marginTop: '2rem' }}>
              <button className="close-warning-btn" onClick={() => setShowWarning(false)}>GOT IT!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
