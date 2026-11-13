import { AspectRatio, Chapter } from '../utils/player-math';
import coverBunnyImg from '../assets/images/cover_bunny_trailer_1794561446737.jpg';
import coverSintelImg from '../assets/images/cover_sintel_trailer_1794561445970.jpg';
import coverOceansImg from '../assets/images/cover_oceans_clip_1794561447355.jpg';
import coverFlowerImg from '../assets/images/cover_flower_timelapse_1794561447187.jpg';

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
    id: 'big-buck-bunny',
    title: 'BIG BUCK BUNNY',
    subtitle: 'Peach Open Movie Trailer',
    director: 'Sacha Goedegebure · Blender Open Movie',
    durationString: '00:33',
    aspectRatio: '16:9',
    colorGrade: 'pristine',
    ambientGlowColor: 'rgba(103, 212, 255, 0.22)',
    thumbnail: coverBunnyImg,
    streamUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis:
      'Animated trailer from the Blender Institute’s Peach Open Movie Project following a gentle giant rabbit in a sunlit woodland meadow confronted by three mischievous rodents.',
    specs: {
      resolution: '853 × 480 (16:9 Widescreen)',
      codec: 'H.264 / MP4 Web Delivery',
      audio: 'AAC Stereo',
      fps: 'Native Stream',
      colorSpace: 'Rec.709',
    },
    chapters: [
      { id: 'b1', time: 0, title: 'Opening Credits', description: 'The Peach Open Movie Project presents.' },
      { id: 'b2', time: 6, title: 'One Big Rabbit', description: 'Sunlit meadow burrow beneath the woodland tree.' },
      { id: 'b3', time: 11, title: 'Three Rodents', description: 'Mischievous forest trio plots in the grass.' },
      { id: 'b4', time: 17, title: 'And One Giant Payback', description: 'Woodland confrontation with the butterfly and stone.' },
      { id: 'b5', time: 25, title: 'Trailer Finale', description: 'Closing animated sequence and title card.' },
    ],
  },
  {
    id: 'sintel',
    title: 'SINTEL',
    subtitle: 'Durian Open Movie Trailer',
    director: 'Colin Levy · Blender Foundation',
    durationString: '00:52',
    aspectRatio: '2.39:1',
    colorGrade: 'pristine',
    ambientGlowColor: 'rgba(147, 197, 253, 0.22)',
    thumbnail: coverSintelImg,
    streamUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis:
      'Animated fantasy trailer from the Blender Foundation’s Durian project following a lone wanderer across desert dunes and stormy skies in search of a young dragon.',
    specs: {
      resolution: '854 × 480 (2.35:1 Theatrical Matte)',
      codec: 'H.264 / MP4 Web Delivery',
      audio: 'AAC Stereo',
      fps: 'Native Stream',
      colorSpace: 'Rec.709',
    },
    chapters: [
      { id: 's1', time: 0, title: 'The Shaman’s Counsel', description: 'An elder speaks with the traveler beside the fire.' },
      { id: 's2', time: 14, title: 'Flight Through the Clouds', description: 'Dragons soaring through amber storm skies.' },
      { id: 's3', time: 27, title: 'The Horned Dragon', description: 'Confrontation high above the golden cloudbank.' },
      { id: 's4', time: 40, title: 'Across the Dunes', description: 'Solitary figure crossing sunlit desert ridges.' },
    ],
  },
  {
    id: 'oceans',
    title: 'OCEANS',
    subtitle: 'Pelagic Dive & Marine Schools',
    director: 'Open Marine Cinema Archive',
    durationString: '00:47',
    aspectRatio: '2.39:1',
    colorGrade: 'pristine',
    ambientGlowColor: 'rgba(103, 212, 255, 0.25)',
    thumbnail: coverOceansImg,
    streamUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis:
      'Underwater documentary sequence capturing diving seabirds plunging through sunlit ocean swells into swirling schools of silver baitfish and cruising pelagic sharks.',
    specs: {
      resolution: '960 × 400 (2.40:1 Scope)',
      codec: 'H.264 / MP4 Web Delivery',
      audio: 'AAC Stereo',
      fps: 'Native Stream',
      colorSpace: 'Rec.709',
    },
    chapters: [
      { id: 'o1', time: 0, title: 'Ocean Surface Swell', description: 'Seabirds banking and plunging into deep blue water.' },
      { id: 'o2', time: 14, title: 'The Baitball Swirl', description: 'Dense schools of fish wheeling beneath sunbeams.' },
      { id: 'o3', time: 24, title: 'Pelagic Dive', description: 'Bubble trails descending past sharks and schooling fish.' },
      { id: 'o4', time: 36, title: 'Twilight Current', description: 'Silver fish streams dispersing into deeper water.' },
    ],
  },
  {
    id: 'blooming-portulaca',
    title: 'BLOOMING PORTULACA',
    subtitle: 'Botanical Macro Time-Lapse',
    director: 'MDN Open Media Archive (CC0)',
    durationString: '00:05',
    aspectRatio: '16:9',
    colorGrade: 'pristine',
    ambientGlowColor: 'rgba(203, 213, 225, 0.2)',
    thumbnail: coverFlowerImg,
    streamUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    streamType: 'video/mp4',
    isMux: false,
    synopsis:
      'A macro time-lapse study capturing a scarlet-orange portulaca blossom unfurling its petals to reveal golden stamens amidst purple-rimmed succulent foliage.',
    specs: {
      resolution: '960 × 540 (16:9 qHD)',
      codec: 'H.264 / MP4 Web Delivery',
      audio: 'Silent Visual Study',
      fps: 'Native Stream',
      colorSpace: 'Rec.709',
    },
    chapters: [
      { id: 'f1', time: 0, title: 'Closed Bud', description: 'Tightly furled scarlet petals amidst green leaves.' },
      { id: 'f2', time: 2, title: 'Petal Expansion', description: 'Blossom unfurls outward in soft macro light.' },
      { id: 'f3', time: 4, title: 'Full Bloom', description: 'Golden stamens revealed at peak opening.' },
    ],
  },
];
