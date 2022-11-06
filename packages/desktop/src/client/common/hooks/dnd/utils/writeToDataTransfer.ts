import { CUSTOM_DRAG_TYPE, NATIVE_DRAG_TYPES } from "../constants";
import { DragItem } from "../types";

/**
 *
 * @param dataTransfer
 * @param items
 * @example
 *  [
 *    {
 *      'text/plain': 'hello world',
 *      'text/html': '<strong>hello world</strong>',
 *      'my-app-custom-type': JSON.stringify({
 *         message: 'hello world',
 *         style: 'bold'
 *       })
 *    },
 *  ]
 */
export function writeToDataTransfer(
  dataTransfer: DataTransfer,
  items: DragItem[]
) {
  const groupedByType = new Map<string, string[]>();
  let needsCustomData = false;
  const customData = [];

  for (let item of items) {
    const types = Object.keys(item);

    if (types.length > 1) needsCustomData = true;

    const dataByType = new Map<string, string>();

    for (let type of types) {
      let typeItems = groupedByType.get(type);

      if (!typeItems) {
        typeItems = [];
        groupedByType.set(type, typeItems);
      } else {
        needsCustomData = true;
      }

      const data = item[type];

      dataByType.set(type, data);

      typeItems.push(data);
    }

    customData.push(dataByType);
  }

  for (let [type, items] of groupedByType) {
    if (NATIVE_DRAG_TYPES.has(type)) {
      dataTransfer.items.add(items.join("\n"), type);
    } else {
      // Set data to the first item so we have access to the list of types.
      dataTransfer.items.add(items[0], type);
    }
  }

  if (needsCustomData) {
    let data = JSON.stringify(customData);
    dataTransfer.items.add(data, CUSTOM_DRAG_TYPE);
  }
}
