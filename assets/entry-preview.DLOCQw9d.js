import{d as l}from"./index.DrFu-skq.js";import{j as _}from"./lit-element.Wy23cYDu.js";import{e as O}from"./directive-helpers.DzWiHt87.js";const{global:h}=__STORYBOOK_MODULE_GLOBAL__,{simulatePageLoad:s,simulateDOMContentLoaded:m}=__STORYBOOK_MODULE_PREVIEW_API__;var{Node:u}=h,T=(n,d)=>{let{id:p,component:o}=d;if(!o)throw new Error(`Unable to render story ${p} as the component annotation is missing from the default export`);let t=document.createElement(o);return Object.entries(n).forEach(([i,e])=>{t[i]=e}),t};function a({storyFn:n,kind:d,name:p,showMain:o,showError:t,forceRemount:i},e){let r=n();if(o(),O(r)){(i||!e.querySelector('[id="root-inner"]'))&&(e.innerHTML='<div id="root-inner"></div>');let f=e.querySelector('[id="root-inner"]');_(r,f),s(e)}else if(typeof r=="string")e.innerHTML=r,s(e);else if(r instanceof u){if(e.firstChild===r&&!i)return;e.innerHTML="",e.appendChild(r),m()}else t({title:`Expecting an HTML snippet or DOM node from the story: "${p}" of "${d}".`,description:l`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `})}var g={renderer:"web-components"};export{g as parameters,T as render,a as renderToCanvas};
