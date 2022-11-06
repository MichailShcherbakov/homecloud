import React from "react";
import { DragEndEvent, DragItem, DragMoveEvent, DragStartEvent } from "./types";
import { writeToDataTransfer } from "./utils/writeToDataTransfer";

export interface UseDragProps<
  TElement extends HTMLElement,
  IPreviewElement extends HTMLElement
> {
  /** */
  dragRef?: React.RefObject<TElement>;
  /** */
  previewRef?: React.RefObject<IPreviewElement>;
  /** */
  isDisabled?: boolean;
  /** */
  onDragStart?: (e: DragStartEvent) => void;
  /** */
  onDragMove?: (e: DragMoveEvent) => void;
  /** */
  onDragEnd?: (e: DragEndEvent) => void;
  /** */
  getItems: () => DragItem[] | Promise<DragItem[]>;
}

export interface UseDragResult<
  TElement extends HTMLElement,
  IPreviewElement extends HTMLElement
> {
  /** */
  dragProps: React.HTMLAttributes<TElement>;
  /** */
  previewRrops: React.HTMLAttributes<IPreviewElement>;
  /** */
  isDragging: boolean;
}

export function useDrag<
  TElement extends HTMLElement,
  IPreviewElement extends HTMLElement
>(
  props: UseDragProps<TElement, IPreviewElement>
): UseDragResult<TElement, IPreviewElement> {
  const [isDragging, setIsDragging] = React.useState(false);

  const onDragStart = async (e: React.DragEvent<TElement>) => {
    if (e.defaultPrevented) return;

    const items = await props.getItems();

    writeToDataTransfer(e.dataTransfer, items);

    props.onDragStart?.({
      type: "dragstart",
      x: e.clientX,
      y: e.clientY,
    });

    // Wait a frame before we set dragging to true so that the browser has time to
    // render the preview image before we update the element that has been dragged.
    requestAnimationFrame(() => {
      setIsDragging(true);
    });
  };
  const onDrag = (e: React.DragEvent<TElement>) => {
    props.onDragMove?.({
      type: "dragmove",
      x: e.clientX,
      y: e.clientY,
    });
  };
  const onDragEnd = (e: React.DragEvent<TElement>) => {
    props.onDragEnd?.({
      type: "dragend",
      x: e.clientX,
      y: e.clientY,
    });

    setIsDragging(false);
  };

  return {
    dragProps: {
      draggable: "true",
      onDragStart,
      onDrag,
      onDragEnd,
    },
    previewRrops: {},
    isDragging,
  };
}
