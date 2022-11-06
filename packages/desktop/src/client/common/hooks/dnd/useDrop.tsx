import React from "react";
import {
  DropEnterEvent,
  DropEvent,
  DropLeaveEvent,
  DropOverEvent,
  DropStartEvent,
} from "./types";
import { getDropCoords } from "./utils/getDropCoords";
import { readFromDataTransfer } from "./utils/readFromDataTransfer";

export interface UseDropProps<
  TElement extends HTMLElement,
  TElementIndicator extends HTMLElement
> {
  /** */
  dropRef: React.RefObject<TElement>;
  /** */
  dropIndicatorRef?: React.RefObject<TElementIndicator>;
  /** */
  isDisabled?: boolean;
  /** Handler that is called when a valid drag enters the drop target. */
  onDragEnter?: (e: DropEnterEvent) => void;
  /** */
  onDragStart?: (e: DropStartEvent) => void;
  /** Handler that is called when a valid drag is moved within the drop target. */
  onDragOver?: (e: DropOverEvent) => void;
  /** Handler that is called when a valid drag leaves the drop target. */
  onDragLeave?: (e: DropLeaveEvent) => void;
  /** Handler that is called when a valid drag is dropped on the drop target. */
  onDrop?: (e: DropEvent) => void;
}

export interface UseDropResult<
  TElement extends HTMLElement,
  TElementIndicator extends HTMLElement
> {
  /** */
  dropProps: React.HTMLAttributes<TElement>;
  /** */
  dropIndicatorProps: React.HTMLAttributes<TElementIndicator>;
  /**
   *  Whether the element is currently an active drop target
   */
  isDropTarget: boolean;
}

export function useDrop<
  TElement extends HTMLElement,
  TElementIndicator extends HTMLElement
>(
  props: UseDropProps<TElement, TElementIndicator>
): UseDropResult<TElement, TElementIndicator> {
  const [isDropTarget, setIsDropTarget] = React.useState(false);
  const state = React.useRef({
    dragOverElements: new Set<Element>(),
  }).current;

  const onDragEnter = React.useCallback((e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation();

    state.dragOverElements.add(e.target as Element);

    if (state.dragOverElements.size > 1) return;

    setIsDropTarget(true);

    const { x, y } = getDropCoords(e);

    props.onDragEnter?.({
      type: "dropenter",
      x,
      y,
    });
  }, []);

  const onDragStart = React.useCallback((e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation();

    if (props.dropIndicatorRef?.current)
      e.dataTransfer.setDragImage(props.dropIndicatorRef.current, 0, 0);

    const { x, y } = getDropCoords(e);

    props.onDragStart?.({
      type: "dropstart",
      x,
      y,
    });
  }, []);

  const onDragOver = React.useCallback((e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const { x, y } = getDropCoords(e);

    props.onDragStart?.({
      type: "dropstart",
      x,
      y,
    });
  }, []);

  const onDragLeave = React.useCallback((e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation();

    state.dragOverElements.delete(e.target as Element);

    for (const element of state.dragOverElements) {
      if (!e.currentTarget.contains(element))
        state.dragOverElements.delete(element);
    }

    if (state.dragOverElements.size > 0) return;

    setIsDropTarget(false);

    const { x, y } = getDropCoords(e);

    props.onDragLeave?.({
      type: "dropleave",
      x,
      y,
    });
  }, []);

  const onDrop = React.useCallback((e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    state.dragOverElements.clear();

    setIsDropTarget(false);

    const items = readFromDataTransfer(e.dataTransfer);

    const { x, y } = getDropCoords(e);

    props.onDrop?.({
      type: "drop",
      x,
      y,
      items,
    });
  }, []);

  return {
    dropProps: !props.isDisabled
      ? {
          onDragStart,
          onDragEnter,
          onDragOver,
          onDragLeave,
          onDrop,
          role: "button",
          tabIndex: 0,
        }
      : {},
    dropIndicatorProps: {
      draggable: true,
    },
    isDropTarget,
  };
}
