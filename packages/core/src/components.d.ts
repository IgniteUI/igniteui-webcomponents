/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface IgcButton {
        /**
          * The first name
         */
        "first": string;
        /**
          * The last name
         */
        "last": string;
        /**
          * The middle name
         */
        "middle": string;
    }
}
declare global {
    interface HTMLIgcButtonElement extends Components.IgcButton, HTMLStencilElement {
    }
    var HTMLIgcButtonElement: {
        prototype: HTMLIgcButtonElement;
        new (): HTMLIgcButtonElement;
    };
    interface HTMLElementTagNameMap {
        "igc-button": HTMLIgcButtonElement;
    }
}
declare namespace LocalJSX {
    interface IgcButton {
        /**
          * The first name
         */
        "first"?: string;
        /**
          * The last name
         */
        "last"?: string;
        /**
          * The middle name
         */
        "middle"?: string;
    }
    interface IntrinsicElements {
        "igc-button": IgcButton;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "igc-button": LocalJSX.IgcButton & JSXBase.HTMLAttributes<HTMLIgcButtonElement>;
        }
    }
}
