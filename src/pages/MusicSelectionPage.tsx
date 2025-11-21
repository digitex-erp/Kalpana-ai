// src/pages/MusicSelectionPage.tsx
import React, { useState, useEffect } from 'react';
import { Music } from '../types';
import MusicPlayer from '../components/MusicPlayer';
import { logger } from '../services/logService';

interface MusicSelectionPageProps {
  onNext: (music: Music) => void;
  onBack: () => void;
}

// Helper function to generate Cloudinary audio URL
const getAudioUrl = (cloudinaryId: string | undefined): string | null => {
  if (!cloudinaryId) return null;
  // Using your Cloudinary cloud name
  const cloudName = 'dcwhgtqld';
  return `https://res.cloudinary.com/${cloudName}/video/upload/${cloudinaryId}.mp3`;
};

const musicOptions: Music[] = [
  // FESTIVAL & CELEBRATION MUSIC
  {
    id: 'indian-festival',
    name: '🪔 Indian Traditional Festival',
    description: 'Perfect for Diwali, Holi, religious celebrations, and auspicious occasions',
    mood: 'festive-traditional',
    cloudinaryId: 'Assets/indian-traditional-festival', // UPDATED!
    category: 'Festival',
    icon: '🪔'
  },
  {
    id: 'party-celebration-1',
    name: '🎉 Party Celebration #1',
    description: 'Energetic party music - perfect for gift sets, return gifts, party products',
    mood: 'celebration',
    cloudinaryId: 'event-party-celebration-music-381500_zuqlxd',
    category: 'Festival',
    icon: '🎉'
  },
  {
    id: 'party-celebration-2',
    name: '🎊 Party Celebration #2',
    description: 'Upbeat celebration vibes - ideal for festive product launches',
    mood: 'celebration',
    cloudinaryId: 'event-party-celebration-music-382067_m5ib3k',
    category: 'Festival',
    icon: '🎊'
  },
  {
    id: 'bollywood-punjabi',
    name: '💃 Bollywood Punjabi',
    description: 'Modern Bollywood Punjabi beats - great for colorful, vibrant products',
    mood: 'energetic',
    cloudinaryId: 'bollywood-punjabi-music-298969_rqhghe',
    category: 'Festival',
    icon: '💃'
  },

  // SPIRITUAL & DEVOTIONAL MUSIC
  {
    id: 'krishna-devotional',
    name: '🕉️ Krishna Devotional',
    description: 'Traditional Krishna music - perfect for religious items, spiritual products',
    mood: 'devotional',
    cloudinaryId: 'krishna-indian-music-423136_m0aitm',
    category: 'Spiritual',
    icon: '🕉️'
  },
  {
    id: 'tabla-flute-traditional',
    name: '🪈 Tabla & Flute Traditional',
    description: 'Classic Indian tabla and flute - ideal for cultural, traditional products',
    mood: 'traditional',
    cloudinaryId: 'tabla-flute-106-262274_g6kt8u',
    category: 'Spiritual',
    icon: '🪈'
  },
  {
    id: 'sitar-guitar-fusion',
    name: '🎸 Sitar & Guitar Fusion',
    description: 'East-meets-West fusion - perfect for modern products with traditional touch',
    mood: 'fusion',
    cloudinaryId: 'sitar-amp-guitar-bhagesri-374594_mqux0q',
    category: 'Spiritual',
    icon: '🎸'
  },

  // CALM & MEDITATION MUSIC
  {
    id: 'chakra-meditation',
    name: '🧘 Chakra Meditation',
    description: 'Peaceful flute sounds - perfect for wellness, meditation, relaxation products',
    mood: 'meditation',
    cloudinaryId: 'chakra-relaxing-meditation-music-indian-vibe-peaceful-flute-sounds-311342_rveqav',
    category: 'Calm',
    icon: '🧘'
  },
  {
    id: 'calming-tabla-flute',
    name: '🎵 Calming Tabla & Flute',
    description: 'Soothing Indian background - ideal for home decor, peaceful products',
    mood: 'calm',
    cloudinaryId: 'free-soul-calming-indian-background-music-tabla-flute-385106_i3vonh',
    category: 'Calm',
    icon: '🎵'
  },

  // INSPIRATIONAL & CORPORATE MUSIC
  {
    id: 'inspirational',
    name: '✨ Inspirational',
    description: 'Uplifting, motivational music - great for educational products, learning aids',
    mood: 'inspiring',
    cloudinaryId: 'inspirational-inspiring-music-416527_ri1tmg',
    category: 'Professional',
    icon: '✨'
  },
  {
    id: 'corporate-professional',
    name: '💼 Corporate Professional',
    description: 'Professional background music for office stationery, labels, B2B products',
    mood: 'professional',
    cloudinaryId: 'corporate-background-music-338201_btscjp',
    category: 'Professional',
    icon: '💼'
  },
  {
    id: 'upbeat-worldbeat',
    name: '🌍 Upbeat Worldbeat',
    description: 'Emotional, uplifting world music - versatile for most products',
    mood: 'upbeat',
    cloudinaryId: 'upbeat-together-worldbeat-emotional-world-uplifting-music-185964_quv2xh',
    category: 'Professional',
    icon: '🌍'
  },

  // NO MUSIC OPTION
  {
    id: 'no-music',
    name: '🔇 No Music',
    description: 'Generate video without background music',
    mood: 'silent',
    cloudinaryId: undefined,
    category: 'Other',
    icon: '🔇'
  }
];

const MusicSelectionPage: React.FC<MusicSelectionPageProps> = ({ onNext, onBack }) => {
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [customAudioId, setCustomAudioId] = useState('');
  const [previewingMusic, setPreviewingMusic] = useState<Music | null>(null);

  useEffect(() => {
    if (!selectedMusic && musicOptions.length > 0) {
      const defaultMusic = musicOptions.find(m => m.id === 'indian-festival');
      if (defaultMusic) {
        setSelectedMusic(defaultMusic);
        logger.info('Music', `Auto-selected default: ${defaultMusic.name}`);
      }
    }
  }, [selectedMusic]);

  const handleSelectMusic = (music: Music) => {
    setSelectedMusic(music);
    logger.info('Music', `Selected: ${music.name}`);
  };

  const handlePreview = (music: Music) => {
    if (previewingMusic?.id === music.id) {
      setPreviewingMusic(null);
      logger.info('Music', `Stopped preview: ${music.name}`);
    } else {
      setPreviewingMusic(music);
      logger.info('Music', `Previewing: ${music.name}`);
    }
  };

  const handleNext = () => {
    if (selectedMusic) {
      logger.success('Music', `Proceeding with: ${selectedMusic.name} (${selectedMusic.cloudinaryId || 'no audio'})`);
      onNext(selectedMusic);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-200">Select Music Style</h2>
        <p className="text-gray-400">Choose a musical mood to guide the video's atmosphere and emotional tone.</p>
      </div>

      <div className="space-y-6">
        {['Festival', 'Spiritual', 'Calm', 'Professional', 'Other'].map(category => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              {category === 'Festival' && <span>🎉</span>}
              {category === 'Spiritual' && <span>🕉️</span>}
              {category === 'Calm' && <span>🧘</span>}
              {category === 'Professional' && <span>💼</span>}
              {category === 'Other' && <span>🔇</span>}
              {category}
            </h3>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${category === 'Spiritual' || category === 'Professional' ? 'lg:grid-cols-3' : ''} ${category === 'Festival' ? 'lg:grid-cols-4' : ''} gap-4`}>
              {musicOptions.filter(m => m.category === category).map((music) => (
                <div key={music.id} className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSelectMusic(music)}
                    className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${selectedMusic?.id === music.id
                      ? 'border-cyan-500 bg-cyan-500/20 scale-105'
                      : 'border-gray-700 bg-gray-800 hover:border-cyan-500/50'
                      }`}
                  >
                    <div className="text-4xl mb-3">{music.icon}</div>
                    <div className="text-white font-semibold mb-2">{music.name}</div>
                    <div className="text-gray-400 text-sm mb-3">{music.description}</div>

                    {/* Preview Button */}
                    {music.cloudinaryId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(music);
                        }}
                        className={`mt-2 w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${previewingMusic?.id === music.id
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                      >
                        {previewingMusic?.id === music.id ? '⏹ Stop Preview' : '▶ Preview'}
                      </button>
                    )}
                  </button>

                  {/* Music Player */}
                  {previewingMusic?.id === music.id && music.cloudinaryId && (
                    <div className="animate-fade-in">
                      <MusicPlayer
                        audioUrl={getAudioUrl(music.cloudinaryId) || ''}
                        trackName={music.name}
                        autoPlay={true}
                        onError={(error) => {
                          logger.error('Music', `Preview failed for ${music.name}`, error);
                          setPreviewingMusic(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
        <button
          onClick={() => setShowBrowser(!showBrowser)}
          className="text-white font-semibold flex items-center gap-2 hover:text-cyan-400 transition-colors w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <span>🎼</span>
            <span>Use Custom Audio from Cloudinary</span>
          </div>
          <span className={`transform transition-transform ${showBrowser ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showBrowser && (
          <div className="mt-4 space-y-3">
            <p className="text-gray-400 text-sm">
              Have other audio files in your Cloudinary account? Enter the Public ID here:
            </p>
            <input
              type="text"
              value={customAudioId}
              onChange={(e) => setCustomAudioId(e.target.value)}
              placeholder="e.g., my-folder/my-audio-file or just audio-file-name"
              className="w-full p-3 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (customAudioId.trim()) {
                  handleSelectMusic({
                    id: 'custom',
                    name: `Custom: ${customAudioId.trim()}`,
                    description: 'Custom audio track from Cloudinary.',
                    mood: 'custom',
                    cloudinaryId: customAudioId.trim(),
                    category: 'Other',
                    icon: '🎶'
                  });
                  setShowBrowser(false);
                }
              }}
              disabled={!customAudioId.trim()}
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              ✅ Use This Audio
            </button>
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Go to your Cloudinary Media Library to find the exact Public ID of any audio file.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={onBack}
          className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedMusic}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Narration Voice →
        </button>
      </div>
    </div>
  );
};

export default MusicSelectionPage;