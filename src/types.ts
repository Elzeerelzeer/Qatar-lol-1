export type StationId = 'souq' | 'sea' | 'nokhatha' | 'majlis' | 'fereej' | 'studio' | 'treasure';

export interface StationInfo {
  id: StationId;
  name: string;
  englishName: string;
  stamp: string;
  description: string;
  x: number; // percentage in village map
  y: number; // percentage in village map
  icon: string;
  isEducational: boolean; // 5 educational stations unlock the treasure
}

export interface StampRecord {
  stationId: StationId;
  stationName: string;
  stamp: string;
  unlockedAt: number;
}

export type SoundStatus = 'working' | 'stopped' | 'no-arabic';

export interface VisitorPosition {
  x: number;
  y: number;
}

export type AppScreen = 'gate' | 'village' | 'station' | 'treasure';
