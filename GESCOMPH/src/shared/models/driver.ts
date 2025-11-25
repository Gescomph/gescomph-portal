export interface TourPopover {
  title: string;
  description: string;
  side?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface TourStep {
  element: string;       // Selector de DOM
  popover: TourPopover;  // Información del popover
}

