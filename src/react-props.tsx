import { createComponent as createComponentBase } from '@lit/react';
import React from 'react';
import { createPortal } from 'react-dom';

import { SlotRequestEvent, remove } from './render-props.js';

// TODO: Fork and extend the lit/react wrapper

export const createComponent = (options: any) => {
  const renderProps = options.renderProps;
  if (renderProps === undefined) {
    return createComponentBase(options);
  }

  const outOptions = {
    ...options,
    events: {
      ...(options.events ?? []),
      onSlotRequest: 'slot-request',
    },
  };

  const component = createComponentBase(outOptions);
  return (inProps: any) => {
    const [slottedChildren, setSlottedChildren] = React.useState(new Map());
    const outProps = {} as any;
    const slotRenderers = {} as any;
    let hasRenderers = false;

    for (const p in inProps) {
      if (renderProps[p] === undefined) {
        outProps[p] = inProps[p];
      } else {
        slotRenderers[renderProps[p]] = inProps[p];
        hasRenderers = true;
      }
    }

    outProps.onSlotRequest = (request: SlotRequestEvent) => {
      if (!hasRenderers) {
        return;
      }

      if (request.data === remove) {
        slottedChildren.delete(request.slotName);
      } else {
        const children = slotRenderers[request.name]?.(request.data);
        request.isReact = hasRenderers;

        slottedChildren.set(
          request.slotName,
          createPortal(children, request.node, request.slotName)
        );
      }

      setSlottedChildren(new Map(slottedChildren));
    };

    outProps.children = [
      ...React.Children.toArray(inProps.children),
      ...slottedChildren.values(),
    ];

    return React.createElement(component, outProps);
  };
};
