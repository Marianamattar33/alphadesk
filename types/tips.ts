export type VerdictColor = 'green' | 'gold' | 'red' | 'purple' | 'gray';

export interface TipLine {
  label: string;
  value: string;
}

export interface TipVerdict {
  color: VerdictColor;
  text: string;
}

export interface TipCurrent {
  text: string;
  verdict: VerdictColor;
  interpretation: string;
}

export interface TipContent {
  title: string;
  lines: TipLine[];
  verdicts?: TipVerdict[];
  current?: TipCurrent;
}
