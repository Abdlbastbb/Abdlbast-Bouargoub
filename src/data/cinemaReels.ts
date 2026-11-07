import { AspectRatio, Chapter } from '../utils/player-math';

export interface FilmReel {
  id: string;
  title: string;
  subtitle: string;
  director: string;
  durationString: string;
  aspectRatio: AspectRatio;
  colorGrade: 'pristine' | 'celluloid' | 'noir' | 'vermilion';
  ambientGlowColor: string; // RGB/Hex for Living Frame bleed
  thumbnail: string;
  streamUrl: string;
  streamType: string;
  isMux: boolean;
  muxPlaybackId?: string;
  synopsis: string;
  specs: {
    resolution: string;
    codec: string;
    audio: string;
    fps: string;
    colorSpace: string;
  };
  chapters: Chapter[];
}

export const CINEMA_REELS: FilmReel[] = [
  {
    id: 'cosmic-odyssey',
    title: 'THE COSMIC HORIZON',
    subtitle: 'Deep Stellar Observatories & Gravitational Lensing',
    director: 'Nexus Cinema Lab · 2026',
    durationString: '09:56',
    aspectRatio: '2.39:1',
    colorGrade: 'pristine',
    ambientGlowColor: 'rgba(255, 86, 56, 0.45)', // Electric Vermilion aura
    thumbnail: '/src/assets/images/film_cosmic_odyssey_1794055734185.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis: 'A groundbreaking cinematic visualization exploring deep space nebulae, interstellar gravitational phenomena, and quantum light behavior across obsidian cosmic voids.',
    specs: {
      resolution: '3840 × 2160 (4K Master)',
      codec: 'HEVC / H.265 (Video.js v10)',
      audio: 'Dolby Atmos · 7.1 Spatial Master',
      fps: '24.000 fps (DCI Cinema Standard)',
      colorSpace: 'DCI-P3 Wide Gamut · HDR10',
    },
    chapters: [
      { id: 'c1', time: 0, title: 'Prologue: Cosmic Dawn', description: 'Gravitational condensation of interstellar hydrogen clouds.' },
      { id: 'c2', time: 65, title: 'Act I: Stellar Ignition', description: 'Nuclear fusion ignition at the core of the primary protostar.' },
      { id: 'c3', time: 180, title: 'Act II: The Vermilion Flare', description: 'Coronal mass ejection illuminating planetary dust rings.' },
      { id: 'c4', time: 340, title: 'Act III: Event Horizon', description: 'Approaching the accretion boundary of the central singularity.' },
      { id: 'c5', time: 480, title: 'Epilogue: Eternal Echo', description: 'Dissipation into the boundless obsidian void.' },
    ],
  },
  {
    id: 'tears-of-steel',
    title: 'TEARS OF STEEL',
    subtitle: 'Dystopian Sci-Fi & Neural Robotics',
    director: 'Ian Hubert · Blender Open Cinema',
    durationString: '12:14',
    aspectRatio: '2.39:1',
    colorGrade: 'celluloid',
    ambientGlowColor: 'rgba(255, 120, 50, 0.4)', // Warm ember flare
    thumbnail: '/src/assets/images/film_cyberpunk_monolith_1794055734841.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis: 'Set in a dystopian future Amsterdam where a group of warriors and scientists assemble at the Oude Kerk to stage an epochal neural reconnection experiment with towering biomechanical sentinels.',
    specs: {
      resolution: '4096 × 1714 (Cinema 4K Anamorphic)',
      codec: 'ProRes 4444 Master / H.264 Web Delivery',
      audio: '5.1 Surround Sound Uncompressed',
      fps: '24.000 fps',
      colorSpace: 'ACEScc Film Emulsion',
    },
    chapters: [
      { id: 't1', time: 0, title: 'Arrival at the Oude Kerk', description: 'Reconnaissance through the overgrown canal ruins.' },
      { id: 't2', time: 90, title: 'The Neural Bridge', description: 'Calibrating the cybernetic memory apparatus.' },
      { id: 't3', time: 240, title: 'Celia Awakens', description: 'Sentinel visual array locks onto the laboratory spire.' },
      { id: 't4', time: 420, title: 'Assault on the Spire', description: 'Rocket barrage and electromagnetic counter-measures.' },
      { id: 't5', time: 600, title: 'The Memory Sequence', description: 'A final emotional reconciliation across silicon and bone.' },
    ],
  },
  {
    id: 'ocean-abyss',
    title: 'ABYSSAL BIOLUMINESCENCE',
    subtitle: 'The Hadal Trenches & Living Light',
    director: 'Nexus Oceanic Collective · 2026',
    durationString: '08:42',
    aspectRatio: '16:9',
    colorGrade: 'noir',
    ambientGlowColor: 'rgba(0, 210, 255, 0.4)', // Deep ocean cyan
    thumbnail: '/src/assets/images/film_ocean_abyss_1794055736286.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis: 'Submersible cameras descend 11,000 meters into the Mariana Trench, capturing the hypnotic, unearthly chemiluminescence of creatures that generate light in absolute darkness.',
    specs: {
      resolution: '3840 × 2160 UHD',
      codec: 'AV1 High Efficiency Stream',
      audio: 'Hydrophone Sub-Bass Array (96kHz / 24-bit)',
      fps: '60.000 fps High Frame Rate',
      colorSpace: 'BT.2020 High Dynamic Range',
    },
    chapters: [
      { id: 'o1', time: 0, title: 'Descent through the Midnight Zone', description: 'Sunlight fades entirely beyond 1,000 meters.' },
      { id: 'o2', time: 110, title: 'Comb Jellies & Spectral Light', description: 'Diffraction patterns along ciliary plates.' },
      { id: 'o3', time: 280, title: 'Hydrothermal Vent Chimneys', description: 'Superheated mineral spires teeming with extremophiles.' },
      { id: 'o4', time: 450, title: 'The Hadal Floor', description: 'Silent volcanic sediment at the bottom of the world.' },
    ],
  },
  {
    id: 'kinetic-lumina',
    title: 'KINETIC LUMINA',
    subtitle: 'Architectural Photons & Spatial Resonance',
    director: 'Studio Nexus & Atelier Vermilion',
    durationString: '05:32',
    aspectRatio: '21:9',
    colorGrade: 'vermilion',
    ambientGlowColor: 'rgba(255, 60, 40, 0.5)', // Pure vermilion
    thumbnail: '/src/assets/images/film_kinetic_light_1794055736830.jpg',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis: 'An audiovisual exploration of suspended glass refraction ribbons, laser scanning geometry, and acoustic vibration in an obsidian brutalist space.',
    specs: {
      resolution: '5120 × 2160 (Ultrawide 5K)',
      codec: 'H.264 / AAC High Profile',
      audio: 'Binaural Spatial Acoustics',
      fps: '30.000 fps',
      colorSpace: 'Rec.709 Mastered',
    },
    chapters: [
      { id: 'k1', time: 0, title: 'Photon Dispersion', description: 'Single beam refracted through 48 optical prism elements.' },
      { id: 'k2', time: 80, title: 'Harmonic Oscillation', description: 'Resonant frequencies bending acoustic fluid surfaces.' },
      { id: 'k3', time: 190, title: 'Vermilion Climax', description: 'Total laser convergence into a kinetic light sculpture.' },
    ],
  },
];
