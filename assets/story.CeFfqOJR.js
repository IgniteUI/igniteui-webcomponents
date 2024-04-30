import{x as o}from"./lit-element.Wy23cYDu.js";import{d as i,s as r}from"./defineComponents.DVY7fKDn.js";i(r);function u(e){return Object.fromEntries(Object.entries(structuredClone(e.argTypes)).map(([t,n])=>[t,Object.assign(n,{table:{disable:!0}})]))}function s(e){const t=document.createElement("igc-dialog");t.title="Form submission result",t.addEventListener("igcClosed",()=>t.remove());const n=document.createElement("pre");n.textContent=JSON.stringify(Object.fromEntries(e),void 0,"	"),t.appendChild(n),document.body.appendChild(t),t.show()}function c(e){e.preventDefault(),s(new FormData(e.currentTarget))}function m(){return o`
    <fieldset>
      <igc-button variant="outlined" type="submit">Submit</igc-button>
      <igc-button variant="outlined" type="reset">Reset</igc-button>
    </fieldset>
  `}export{m as a,u as d,c as f};
