import { useLocation } from 'react-router-dom';

export function useQueryParams(): { [key: string]: undefined | string } {
  return Object.fromEntries(new URLSearchParams(useLocation().search));
}
