export function getDropCoords<TElement extends HTMLElement>(
  e: React.DragEvent<TElement>
) {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: e.clientX - rect.x,
    y: e.clientY - rect.y,
  };
}
