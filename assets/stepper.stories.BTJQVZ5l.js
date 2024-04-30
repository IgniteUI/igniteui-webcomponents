import{x as b}from"./lit-element.Wy23cYDu.js";import{d as f,g as v,N as y}from"./defineComponents.DVY7fKDn.js";import"./config.Dbb4Rit-.js";import"./directive-helpers.DzWiHt87.js";import"./iframe-cdRUqP9w.js";import"../sb-preview/runtime.js";f(y,v);const N={title:"Stepper",component:"igc-stepper",parameters:{docs:{description:{component:"IgxStepper provides a wizard-like workflow by dividing content into logical steps."}},actions:{handles:["igcActiveStepChanging","igcActiveStepChanged"]}},argTypes:{orientation:{type:'"horizontal" | "vertical"',description:"Gets/Sets the orientation of the stepper.",options:["horizontal","vertical"],control:{type:"inline-radio"},table:{defaultValue:{summary:"horizontal"}}},stepType:{type:'"indicator" | "title" | "full"',description:"Get/Set the type of the steps.",options:["indicator","title","full"],control:{type:"inline-radio"},table:{defaultValue:{summary:"full"}}},linear:{type:"boolean",description:"Get/Set whether the stepper is linear.",control:"boolean",table:{defaultValue:{summary:!1}}},contentTop:{type:"boolean",description:"Get/Set whether the content is displayed above the steps.",control:"boolean",table:{defaultValue:{summary:!1}}},verticalAnimation:{type:'"grow" | "fade" | "none"',description:"The animation type when in vertical mode.",options:["grow","fade","none"],control:{type:"inline-radio"},table:{defaultValue:{summary:"grow"}}},horizontalAnimation:{type:'"slide" | "fade" | "none"',description:"The animation type when in horizontal mode.",options:["slide","fade","none"],control:{type:"inline-radio"},table:{defaultValue:{summary:"slide"}}},animationDuration:{type:"number",description:"The animation duration in either vertical or horizontal mode.",control:"number",table:{defaultValue:{summary:320}}},titlePosition:{type:'"bottom" | "top" | "end" | "start"',description:"Get/Set the position of the steps title.",options:["bottom","top","end","start"],control:{type:"select"}}},args:{orientation:"horizontal",stepType:"full",linear:!1,contentTop:!1,verticalAnimation:"grow",horizontalAnimation:"slide",animationDuration:320}},h=({orientation:s,stepType:r,titlePosition:p,linear:l,contentTop:c,animationDuration:m,verticalAnimation:u,horizontalAnimation:d})=>{const e=()=>{document.getElementById("stepper").next()},n=()=>{document.getElementById("stepper").prev()};return b`
    <span>test content top</span>

    <igc-stepper
      id="stepper"
      .orientation=${s}
      .stepType=${r}
      .titlePosition=${p}
      .linear=${l}
      .contentTop=${c}
      .animationDuration=${m}
      .verticalAnimation=${u}
      .horizontalAnimation=${d}
    >
      <igc-step>
        <span slot="title">Step1</span>
        <label for="first-name">First Name:</label>
        <input type="text" id="first-name" name="first-name" required />
        <br /><br />
        <igc-button @click=${e}>Next</igc-button>
      </igc-step>

      <igc-step>
        <span slot="title">Step 2</span>
        <label for="last-name">Last Name:</label>
        <input type="text" id="last-name" name="last-name" required />
        <br /><br />
        <igc-button @click=${n}>Prev</igc-button>
        <igc-button @click=${e}>Next</igc-button>
      </igc-step>

      <igc-step optional>
        <span slot="title">Step 3</span>
        <span slot="subtitle">(Optional)</span>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
        soluta nulla asperiores, officia ullam recusandae voluptatem omnis
        perferendis vitae non magni magnam praesentium placeat nemo quas
        repudiandae. Nisi, quo ex!
        <br /><br />
        <igc-button @click=${n}>Prev</igc-button>
        <igc-button @click=${e}>Next</igc-button>
      </igc-step>

      <igc-step>
        <span slot="title">Step 4</span>
        <div tabindex="0">
          Tabbable content
          <br />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          soluta nulla asperiores, officia ullam recusandae voluptatem omnis
          perferendis vitae non magni magnam praesentium placeat nemo quas
          repudiandae. Nisi, quo ex!
        </div>
        <br />
        <igc-button @click=${n}>Prev</igc-button>
      </igc-step>
    </igc-stepper>

    <span>test content bottom</span>
  `},t=h.bind({});var i,o,a;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`({
  orientation,
  stepType,
  titlePosition,
  linear,
  contentTop,
  animationDuration,
  verticalAnimation,
  horizontalAnimation
}: IgcStepperArgs) => {
  const next = () => {
    const stepper = (document.getElementById('stepper') as IgcStepperComponent);
    stepper.next();
  };
  const prev = () => {
    const stepper = (document.getElementById('stepper') as IgcStepperComponent);
    stepper.prev();
  };
  return html\`
    <span>test content top</span>

    <igc-stepper
      id="stepper"
      .orientation=\${orientation}
      .stepType=\${stepType}
      .titlePosition=\${titlePosition}
      .linear=\${linear}
      .contentTop=\${contentTop}
      .animationDuration=\${animationDuration}
      .verticalAnimation=\${verticalAnimation}
      .horizontalAnimation=\${horizontalAnimation}
    >
      <igc-step>
        <span slot="title">Step1</span>
        <label for="first-name">First Name:</label>
        <input type="text" id="first-name" name="first-name" required />
        <br /><br />
        <igc-button @click=\${next}>Next</igc-button>
      </igc-step>

      <igc-step>
        <span slot="title">Step 2</span>
        <label for="last-name">Last Name:</label>
        <input type="text" id="last-name" name="last-name" required />
        <br /><br />
        <igc-button @click=\${prev}>Prev</igc-button>
        <igc-button @click=\${next}>Next</igc-button>
      </igc-step>

      <igc-step optional>
        <span slot="title">Step 3</span>
        <span slot="subtitle">(Optional)</span>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
        soluta nulla asperiores, officia ullam recusandae voluptatem omnis
        perferendis vitae non magni magnam praesentium placeat nemo quas
        repudiandae. Nisi, quo ex!
        <br /><br />
        <igc-button @click=\${prev}>Prev</igc-button>
        <igc-button @click=\${next}>Next</igc-button>
      </igc-step>

      <igc-step>
        <span slot="title">Step 4</span>
        <div tabindex="0">
          Tabbable content
          <br />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          soluta nulla asperiores, officia ullam recusandae voluptatem omnis
          perferendis vitae non magni magnam praesentium placeat nemo quas
          repudiandae. Nisi, quo ex!
        </div>
        <br />
        <igc-button @click=\${prev}>Prev</igc-button>
      </igc-step>
    </igc-stepper>

    <span>test content bottom</span>
  \`;
}`,...(a=(o=t.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};const k=["Basic"];export{t as Basic,k as __namedExportsOrder,N as default};
