export enum FrameWidth {
  EXTRA_NARROW = 'extra_narrow',
  NARROW = 'narrow',
  MEDIUM = 'medium',
  WIDE = 'wide',
  EXTRA_WIDE = 'extra_wide',
}

const FRAME_WIDTH_LABELS: Record<FrameWidth, string> = {
  [FrameWidth.EXTRA_NARROW]: 'Extra narrow',
  [FrameWidth.NARROW]: 'Narrow',
  [FrameWidth.MEDIUM]: 'Medium',
  [FrameWidth.WIDE]: 'Wide',
  [FrameWidth.EXTRA_WIDE]: 'Extra wide',
};

export function isFrameWidthValue(value: string): value is FrameWidth {
  return (Object.values(FrameWidth) as string[]).includes(value);
}

export function getFrameWidthLabel(value: string | null): string {
  if (!value) {
    return '';
  }
  if (isFrameWidthValue(value)) {
    return FRAME_WIDTH_LABELS[value];
  }
  return value;
}

export const FRAME_WIDTH_SELECT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: FrameWidth.EXTRA_NARROW, label: FRAME_WIDTH_LABELS[FrameWidth.EXTRA_NARROW] },
  { value: FrameWidth.NARROW, label: FRAME_WIDTH_LABELS[FrameWidth.NARROW] },
  { value: FrameWidth.MEDIUM, label: FRAME_WIDTH_LABELS[FrameWidth.MEDIUM] },
  { value: FrameWidth.WIDE, label: FRAME_WIDTH_LABELS[FrameWidth.WIDE] },
  { value: FrameWidth.EXTRA_WIDE, label: FRAME_WIDTH_LABELS[FrameWidth.EXTRA_WIDE] },
];
