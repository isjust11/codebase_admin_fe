import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector); 