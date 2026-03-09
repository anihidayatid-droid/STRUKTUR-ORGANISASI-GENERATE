export type Position = 'Branch Manager' | 'Assistant Manager' | 'M.S.A' | 'F.S.A' | 'Field Officer';

export interface Staff {
  id: string;
  name: string;
  position: Position;
  phone: string;
  photo: string;
}

export const POSITION_HIERARCHY: Position[] = [
  'Branch Manager',
  'Assistant Manager',
  'M.S.A',
  'F.S.A',
  'Field Officer'
];

export const POSITION_LEVELS: Record<Position, number> = {
  'Branch Manager': 0,
  'Assistant Manager': 1,
  'M.S.A': 2,
  'F.S.A': 2,
  'Field Officer': 3
};
