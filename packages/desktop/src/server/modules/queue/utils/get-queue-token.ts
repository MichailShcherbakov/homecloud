export function getQueueToken(name?: string): string {
  return name ? `QUEUE_MODULE_QUEUE_${name}` : "QUEUE_MODULE_QUEUE_DEFAULT";
}
