import { useAppSelector } from "../../store/hook";

export interface UseQueueOptions {}

export function useQueue(options: UseQueueOptions = {}) {
  const queue = useAppSelector(state => state.queue.jobs);

  return {
    queue,
  };
}
