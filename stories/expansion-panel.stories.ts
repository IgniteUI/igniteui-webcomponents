import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcExpansionPanelComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';

defineComponents(IgcExpansionPanelComponent);

// region default
const metadata: Meta<IgcExpansionPanelComponent> = {
  title: 'ExpansionPanel',
  component: 'igc-expansion-panel',
  parameters: {
    docs: {
      description: {
        component:
          'The Expansion Panel Component provides a way to display information in a toggleable way -\ncompact summary view containing title and description and expanded detail view containing\nadditional content to the summary header.',
      },
    },
    actions: {
      handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description:
        'Indicates whether the contents of the control should be visible.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      type: 'boolean',
      description:
        'Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    indicatorPosition: {
      type: '"start" | "end" | "none"',
      description: 'The indicator position of the expansion panel.',
      options: ['start', 'end', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'start' } },
    },
  },
  args: { open: false, disabled: false, indicatorPosition: 'start' },
};

export default metadata;

interface IgcExpansionPanelArgs {
  /** Indicates whether the contents of the control should be visible. */
  open: boolean;
  /** Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions. */
  disabled: boolean;
  /** The indicator position of the expansion panel. */
  indicatorPosition: 'start' | 'end' | 'none';
}
type Story = StoryObj<IgcExpansionPanelArgs>;

// endregion

registerIconFromText(
  'ferris',
  `<svg width="100%" height="100%" viewBox="0 0 1200 800" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
<g id="Layer-1" serif:id="Layer 1">
    <g transform="matrix(1,0,0,1,597.344,637.02)">
        <path d="M0,-279.559C-121.238,-279.559 -231.39,-264.983 -312.939,-241.23L-312.939,-38.329C-231.39,-14.575 -121.238,0 0,0C138.76,0 262.987,-19.092 346.431,-49.186L346.431,-230.37C262.987,-260.465 138.76,-279.559 0,-279.559" style="fill:rgb(165,43,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,1068.75,575.642)">
        <path d="M0,-53.32L-14.211,-82.761C-14.138,-83.879 -14.08,-84.998 -14.08,-86.121C-14.08,-119.496 -48.786,-150.256 -107.177,-174.883L-107.177,2.643C-79.932,-8.849 -57.829,-21.674 -42.021,-35.482C-46.673,-16.775 -62.585,21.071 -75.271,47.686C-96.121,85.752 -103.671,118.889 -102.703,120.53C-102.086,121.563 -94.973,110.59 -84.484,92.809C-60.074,58.028 -13.82,-8.373 -4.575,-25.287C5.897,-44.461 0,-53.32 0,-53.32" style="fill:rgb(165,43,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,149.064,591.421)">
        <path d="M0,-99.954C0,-93.526 1.293,-87.194 3.788,-80.985L-4.723,-65.835C-4.723,-65.835 -11.541,-56.989 0.465,-38.327C11.055,-21.872 64.1,42.54 92.097,76.271C104.123,93.564 112.276,104.216 112.99,103.187C114.114,101.554 105.514,69.087 81.631,32.046C70.487,12.151 57.177,-14.206 49.189,-33.675C71.492,-19.559 100.672,-6.755 135.341,4.265L135.341,-204.17C51.797,-177.622 0,-140.737 0,-99.954" style="fill:rgb(165,43,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,1151.27,281.813)">
        <path d="M0,240.343L-93.415,171.532C-94.295,168.468 -95.171,165.405 -96.077,162.37L-65.394,117.919C-62.264,113.397 -61.629,107.521 -63.663,102.364C-65.7,97.234 -70.154,93.554 -75.426,92.654L-127.31,83.849C-129.318,79.747 -131.426,75.707 -133.54,71.699L-111.743,21.796C-109.5,16.709 -109.974,10.801 -112.946,6.188C-115.907,1.552 -120.936,-1.156 -126.295,-0.945L-178.951,0.968C-181.678,-2.582 -184.447,-6.1 -187.272,-9.553L-175.172,-63.043C-173.947,-68.476 -175.494,-74.161 -179.275,-78.107C-183.037,-82.039 -188.504,-83.666 -193.701,-82.39L-244.99,-69.782C-248.311,-72.717 -251.688,-75.615 -255.104,-78.455L-253.256,-133.369C-253.058,-138.928 -255.649,-144.211 -260.1,-147.294C-264.546,-150.398 -270.193,-150.867 -275.056,-148.56L-322.903,-125.813C-326.757,-128.023 -330.631,-130.213 -334.547,-132.33L-343.002,-186.445C-343.859,-191.928 -347.387,-196.584 -352.328,-198.711C-357.251,-200.848 -362.896,-200.158 -367.219,-196.903L-409.878,-164.896C-414.078,-166.291 -418.297,-167.628 -422.57,-168.907L-440.956,-220.223C-442.826,-225.452 -447.137,-229.294 -452.394,-230.374C-457.633,-231.446 -463.024,-229.632 -466.657,-225.572L-502.563,-185.401C-506.906,-185.901 -511.249,-186.357 -515.606,-186.732L-543.33,-233.445C-546.14,-238.177 -551.1,-241.057 -556.446,-241.057C-561.78,-241.057 -566.75,-238.177 -569.536,-233.445L-597.269,-186.732C-601.627,-186.357 -605.991,-185.901 -610.325,-185.401L-646.235,-225.572C-649.871,-229.632 -655.282,-231.446 -660.503,-230.374C-665.758,-229.282 -670.076,-225.452 -671.936,-220.223L-690.338,-168.907C-694.598,-167.628 -698.819,-166.28 -703.029,-164.896L-745.673,-196.903C-750.009,-200.169 -755.653,-200.858 -760.589,-198.711C-765.508,-196.584 -769.05,-191.928 -769.902,-186.445L-778.363,-132.33C-782.277,-130.213 -786.152,-128.036 -790.016,-125.813L-837.858,-148.56C-842.716,-150.876 -848.387,-150.398 -852.812,-147.294C-857.257,-144.211 -859.854,-138.928 -859.652,-133.369L-857.817,-78.455C-861.222,-75.615 -864.591,-72.717 -867.929,-69.782L-919.208,-82.39C-924.418,-83.655 -929.878,-82.039 -933.649,-78.107C-937.444,-74.161 -938.98,-68.476 -937.762,-63.043L-925.683,-9.553C-928.485,-6.086 -931.258,-2.582 -933.976,0.968L-986.631,-0.945C-991.945,-1.102 -997.017,1.552 -999.987,6.188C-1002.96,10.801 -1003.41,16.709 -1001.2,21.796L-979.384,71.699C-981.503,75.707 -983.608,79.747 -985.633,83.849L-1037.52,92.654C-1042.79,93.542 -1047.23,97.22 -1049.28,102.364C-1051.32,107.521 -1050.65,113.397 -1047.55,117.919L-1016.85,162.37C-1017.09,163.154 -1017.31,163.947 -1017.55,164.734L-1104.32,256.904C-1104.32,256.904 -1117.61,267.327 -1098.25,291.82C-1081.18,313.425 -993.526,399.072 -947.232,443.943C-927.678,466.722 -914.284,480.829 -912.883,479.609C-910.675,477.669 -922.27,436.224 -960.785,387.597C-990.47,343.968 -1029,276.864 -1019.96,269.13C-1019.96,269.13 -1009.69,256.085 -989.067,246.695C-988.314,247.298 -989.848,246.097 -989.067,246.695C-989.067,246.695 -553.915,447.427 -150.27,250.091C-104.162,241.818 -76.247,266.521 -76.247,266.521C-66.619,272.101 -91.548,341.099 -112.045,386.775C-139.926,438.638 -144.015,479.107 -141.649,480.511C-140.158,481.4 -130.015,465.966 -115.545,441.402C-79.843,391.654 -12.354,296.816 0,273.782C14.006,247.663 0,240.343 0,240.343" style="fill:rgb(247,76,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,450.328,483.629)">
        <path d="M0,167.33C-1.664,165.91 -2.536,165.068 -2.536,165.068L140.006,153.391C23.733,0 -69.418,122.193 -79.333,135.855L-79.333,167.33L0,167.33Z" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,747.12,477.333)">
        <path d="M0,171.974C1.663,170.554 2.536,169.71 2.536,169.71L-134.448,159.687C-18.12,0 69.421,126.835 79.335,140.497L79.335,171.974L0,171.974Z" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,966.094,811.034)">
        <path d="M0,-314.014C0,-314.014 -15.576,-251.973 -112.453,-186.776L-139.619,-180.409C-139.619,-180.409 -227.5,-340.668 -352.002,-160.075C-352.002,-160.075 -313.2,-182.666 -209.18,-155.155C-209.18,-155.155 -257.03,-81.916 -353.422,-84.166C-353.422,-84.166 -261.049,26.654 -120.482,-133.418C-120.482,-133.418 28.113,-190.881 40.164,-314.014L0,-314.014Z" style="fill:rgb(247,76,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,677.392,509.61)">
        <path d="M0,-92.063C0,-92.063 43.486,-139.678 86.974,-92.063C86.974,-92.063 121.144,-28.571 86.974,3.171C86.974,3.171 31.062,47.615 0,3.171C0,3.171 -37.275,-31.75 0,-92.063" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,727.738,435.209)">
        <path d="M0,0.002C0,18.543 -10.93,33.574 -24.408,33.574C-37.885,33.574 -48.814,18.543 -48.814,0.002C-48.814,-18.539 -37.885,-33.572 -24.408,-33.572C-10.93,-33.572 0,-18.539 0,0.002" style="fill:white;fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,483.3,502.984)">
        <path d="M0,-98.439C0,-98.439 74.596,-131.467 94.956,-57.748C94.956,-57.748 116.283,28.178 33.697,33.028C33.697,33.028 -71.613,12.745 0,-98.439" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,520.766,436.428)">
        <path d="M0,0C0,19.119 -11.27,34.627 -25.173,34.627C-39.071,34.627 -50.344,19.119 -50.344,0C-50.344,-19.124 -39.071,-34.627 -25.173,-34.627C-11.27,-34.627 0,-19.124 0,0" style="fill:white;fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,441.397,687.635)">
        <path d="M0,-25.102C91.833,-36.676 144.904,-37.754 144.904,-37.754C22.037,-199.838 -77.661,-53.098 -77.661,-53.098C-102.643,-62.03 -128.114,-96.711 -147.138,-128.688L-223.375,-151.268C-135.502,-2.127 -70.08,0.146 -70.08,0.146C66.134,174.736 130.663,34.441 130.663,34.441C54.195,25.759 0,-25.102 0,-25.102" style="fill:rgb(247,76,0);fill-rule:nonzero;"/>
    </g>
</g>
</svg>`
);

registerIconFromText(
  'ferris-greet',
  `<svg width="100%" height="100%" viewBox="0 0 1200 800" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
<g id="Layer-1" serif:id="Layer 1">
    <g transform="matrix(1,0,0,1,1009.4,506.362)">
        <path d="M0,-7.203L-12.072,-32.209C-12.009,-33.156 -11.961,-34.107 -11.961,-35.062C-11.961,-63.408 -41.439,-89.533 -91.03,-110.451L-91.03,-93.058C-95.866,-94.977 -100.901,-96.845 -106.147,-98.651L-106.147,-106.759C-177.021,-132.319 -282.53,-148.537 -400.388,-148.537C-503.361,-148.537 -596.917,-136.157 -666.179,-115.983L-666.179,-87.737L-666.181,-87.737L-666.181,-121.925C-737.141,-99.375 -781.135,-68.048 -781.135,-33.41C-781.135,-27.95 -780.034,-22.572 -777.918,-17.297L-785.146,-4.43C-785.146,-4.43 -790.938,3.082 -780.74,18.932C-771.746,32.909 -726.692,87.617 -702.913,116.267C-692.699,130.954 -685.772,140.001 -685.167,139.126C-684.212,137.74 -691.518,110.165 -711.802,78.703C-721.268,61.808 -732.57,39.42 -739.356,22.884C-720.414,34.874 -609.126,90.913 -382.124,90.685C-150.13,90.453 -47.009,17.834 -35.691,7.948C-39.646,23.837 -53.159,55.981 -63.936,78.586C-81.642,110.917 -88.056,139.064 -87.232,140.456C-86.708,141.334 -80.667,132.015 -71.756,116.913C-51.025,87.37 -11.739,30.974 -3.889,16.608C5.007,0.323 0,-7.203 0,-7.203" style="fill:rgb(165,43,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,1079.49,294.885)">
        <path d="M0,204.135L-79.343,145.689C-80.088,143.089 -80.833,140.488 -81.603,137.908L-55.541,100.154C-52.881,96.314 -52.345,91.322 -54.072,86.943C-55.803,82.585 -59.587,79.461 -64.062,78.696L-108.128,71.217C-109.837,67.732 -111.626,64.301 -113.422,60.898L-94.907,18.51C-93.004,14.193 -93.402,9.175 -95.929,5.256C-98.446,1.319 -102.715,-0.981 -107.267,-0.802L-151.991,0.823C-154.306,-2.193 -156.658,-5.18 -159.058,-8.114L-148.78,-53.546C-147.738,-58.158 -149.054,-62.989 -152.267,-66.34C-155.462,-69.679 -160.105,-71.062 -164.52,-69.979L-208.082,-59.27C-210.902,-61.763 -213.77,-64.223 -216.67,-66.635L-215.103,-113.276C-214.935,-117.997 -217.136,-122.484 -220.915,-125.105C-224.692,-127.741 -229.485,-128.137 -233.616,-126.179L-274.254,-106.858C-277.527,-108.736 -280.819,-110.595 -284.146,-112.395L-291.327,-158.356C-292.056,-163.012 -295.051,-166.968 -299.246,-168.774C-303.431,-170.591 -308.222,-170.002 -311.894,-167.238L-348.126,-140.053C-351.695,-141.238 -355.279,-142.373 -358.905,-143.46L-374.522,-187.045C-376.11,-191.488 -379.772,-194.751 -384.238,-195.669C-388.688,-196.578 -393.266,-195.037 -396.352,-191.589L-426.851,-157.47C-430.536,-157.893 -434.228,-158.28 -437.927,-158.601L-461.476,-198.277C-463.86,-202.295 -468.073,-204.741 -472.615,-204.741C-477.144,-204.741 -481.365,-202.295 -483.733,-198.277L-507.288,-158.601C-510.989,-158.28 -514.696,-157.893 -518.376,-157.47L-548.875,-191.589C-551.965,-195.037 -556.559,-196.578 -560.997,-195.669C-565.457,-194.739 -569.125,-191.488 -570.704,-187.045L-586.333,-143.46C-589.954,-142.373 -593.538,-141.23 -597.113,-140.053L-633.333,-167.238C-637.016,-170.012 -641.811,-170.599 -646.001,-168.774C-650.182,-166.968 -653.189,-163.012 -653.914,-158.356L-661.1,-112.395C-664.422,-110.595 -667.714,-108.746 -670.995,-106.858L-711.629,-126.179C-715.756,-128.145 -720.574,-127.741 -724.333,-125.105C-728.106,-122.484 -730.313,-117.997 -730.143,-113.276L-728.581,-66.635C-731.475,-64.223 -734.337,-61.763 -737.172,-59.27L-780.726,-69.979C-785.149,-71.053 -789.788,-69.679 -792.991,-66.34C-796.212,-62.989 -797.517,-58.158 -796.482,-53.546L-786.225,-8.114C-788.603,-5.169 -790.958,-2.193 -793.267,0.823L-837.991,-0.802C-842.504,-0.937 -846.812,1.319 -849.334,5.256C-851.861,9.175 -852.244,14.193 -850.363,18.51L-831.835,60.898C-833.634,64.301 -835.421,67.732 -837.144,71.217L-881.207,78.696C-885.686,79.45 -889.459,82.572 -891.201,86.943C-892.929,91.322 -892.368,96.314 -889.727,100.154L-863.661,137.908C-863.862,138.575 -864.048,139.247 -864.248,139.916L-937.944,218.201C-937.944,218.201 -949.24,227.052 -932.797,247.855C-918.297,266.206 -843.846,338.951 -804.526,377.06C-787.92,396.408 -776.542,408.389 -775.354,407.353C-773.478,405.708 -783.326,370.506 -816.036,329.204C-841.252,292.148 -873.977,235.155 -866.303,228.586C-866.303,228.586 -857.574,217.505 -840.061,209.529C-839.42,210.041 -840.723,209.022 -840.061,209.529C-840.061,209.529 -470.466,380.02 -127.632,212.413C-88.468,205.388 -64.759,226.368 -64.759,226.368C-56.583,231.108 -77.755,289.712 -95.166,328.505C-118.845,372.555 -122.317,406.927 -120.31,408.119C-119.042,408.876 -110.427,395.766 -98.138,374.902C-67.814,332.649 -10.492,252.1 0,232.534C11.895,210.352 0,204.135 0,204.135" style="fill:rgb(247,76,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,917.896,244.679)">
        <path d="M0,232.466C0,232.466 53.179,230 123.032,159.004L132.93,137.025C132.93,137.025 24.513,29.177 193.048,-45.266C193.048,-45.266 178.293,-21.154 182.622,72.006C182.622,72.006 233.437,54.357 248.336,-27.934C248.336,-27.934 322.456,69.79 167.834,161.443C167.834,161.443 95.294,277.732 -6.971,266.593L0,232.466Z" style="fill:rgb(247,76,0);fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,676.997,488.361)">
        <path d="M0,-78.192C0,-78.192 36.935,-118.635 73.871,-78.192C73.871,-78.192 102.893,-24.265 73.871,2.695C73.871,2.695 26.384,40.443 0,2.695C0,2.695 -31.658,-26.964 0,-78.192" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,719.761,425.169)">
        <path d="M0,0.004C0,15.75 -9.282,28.518 -20.732,28.518C-32.18,28.518 -41.462,15.75 -41.462,0.004C-41.462,-15.746 -32.18,-28.514 -20.732,-28.514C-9.282,-28.514 0,-15.746 0,0.004" style="fill:white;fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,512.148,482.736)">
        <path d="M0,-83.609C0,-83.609 63.355,-111.661 80.648,-49.047C80.648,-49.047 98.762,23.933 28.618,28.052C28.618,28.052 -60.826,10.824 0,-83.609" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,543.968,426.204)">
        <path d="M0,0.002C0,16.241 -9.572,29.411 -21.381,29.411C-33.185,29.411 -42.76,16.241 -42.76,0.002C-42.76,-16.242 -33.185,-29.409 -21.381,-29.409C-9.572,-29.409 0,-16.242 0,0.002" style="fill:white;fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,593.317,576.574)">
        <path d="M0,-40.271L80.796,-46.755C80.796,-46.755 78.058,-33.749 67.517,-23.986C67.517,-23.986 39.727,6.484 7.844,-26.519C7.844,-26.519 2.627,-32.148 0,-40.271" style="fill-rule:nonzero;"/>
    </g>
    <g transform="matrix(1,0,0,1,269.796,270.778)">
        <path d="M0,190.741C-0.667,190.741 -1.321,190.79 -1.973,190.842C-28.207,184.871 -101.946,165.657 -121.437,134.479C-121.437,134.479 -22.21,21.607 -177.297,-50.54L-159.24,74.338C-159.24,74.338 -207.049,42.389 -217.366,-27.008C-217.366,-27.008 -333.789,57.486 -165.982,138.466C-165.982,138.466 -150.762,195.653 -4.633,241.281L-4.526,240.846C-3.055,241.118 -1.549,241.281 0,241.281C13.808,241.281 25.003,229.969 25.003,216.01C25.003,202.054 13.808,190.741 0,190.741" style="fill:rgb(247,76,0);fill-rule:nonzero;"/>
    </g>
</g>
</svg>`
);

// Replace internal icons by icon reference
//setIconRef('expand', 'default', {
//  name: 'ferris',
//  collection: 'default',
//});
//
//setIconRef('collapse', 'default', {
//  name: 'ferris-greet',
//  collection: 'default',
//});

function onOpening({ detail }: CustomEvent<IgcExpansionPanelComponent>) {
  detail.querySelector('[slot="indicator"]')!.textContent = '💥';
}

function onClosing({ detail }: CustomEvent<IgcExpansionPanelComponent>) {
  detail.querySelector('[slot="indicator"]')!.textContent = '💣';
}

export const Basic: Story = {
  render: (args) => html`
    <igc-expansion-panel
      indicator-position=${args.indicatorPosition}
      ?open=${args.open}
      ?disabled=${args.disabled}
    >
      <h1 slot="title">The Expendables</h1>
      <h2 slot="subtitle">Action, Adventure, Thriller</h2>
      <span
        >Barney Ross leads the "Expendables", a band of highly skilled
        mercenaries including knife enthusiast Lee Christmas, martial arts
        expert Yin Yang, heavy weapons specialist Hale Caesar, demolitionist
        Toll Road and loose-cannon sniper Gunner Jensen.</span
      >
    </igc-expansion-panel>
  `,
};

export const IndicatorSlots: Story = {
  render: ({ disabled, indicatorPosition, open }) => html`
    <h3>Default indicator</h3>
    <igc-expansion-panel
      ?open=${open}
      ?disabled=${disabled}
      .indicatorPosition=${indicatorPosition}
    >
      <p slot="title">TypeScript</p>
      <p slot="subtitle">functional, generic, imperative, object-oriented</p>
      <p>
        TypeScript is a free and open-source high-level programming language
        developed by Microsoft that adds static typing with optional type
        annotations to JavaScript. It is designed for the development of large
        applications and transpiles to JavaScript. Because TypeScript is a
        superset of JavaScript, all JavaScript programs are syntactically valid
        TypeScript, but they can fail to type-check for safety reasons.
      </p>
    </igc-expansion-panel>

    <h3>With indicator and indicator-expanded slots</h3>
    <igc-expansion-panel
      ?open=${open}
      ?disabled=${disabled}
      .indicatorPosition=${indicatorPosition}
    >
      <p slot="title">Rust</p>
      <p slot="subtitle">
        concurrent, functional, generic, imperative, structured
      </p>

      <igc-icon slot="indicator" style="--size: 2rem" name="ferris"></igc-icon>
      <igc-icon
        slot="indicator-expanded"
        style="--size: 2rem"
        name="ferris-greet"
      ></igc-icon>

      <p>
        Rust is a multi-paradigm, general-purpose programming language that
        emphasizes performance, type safety, and concurrency. It enforces memory
        safety, meaning that all references point to valid memory, without
        requiring the use of automated memory management techniques such as
        garbage collection. To simultaneously enforce memory safety and prevent
        data races, its "borrow checker" tracks the object lifetime of all
        references in a program during compilation. Rust was influenced by ideas
        from functional programming, including immutability, higher-order
        functions, and algebraic data types. It is popular for systems
        programming.
      </p>
    </igc-expansion-panel>

    <h3>Switching indicator slot based on the expansion panel open state</h3>
    <igc-expansion-panel
      ?open=${open}
      ?disabled=${disabled}
      .indicatorPosition=${indicatorPosition}
      @igcOpening=${onOpening}
      @igcClosing=${onClosing}
    >
      <p slot="title">C</p>
      <p slot="subtitle">imperative, procedural, structured</p>
      <span slot="indicator" style="font-size: 1.5rem">💣</span>
      <p>
        C is an imperative procedural language, supporting structured
        programming, lexical variable scope, and recursion, with a static type
        system. It was designed to be compiled to provide low-level access to
        memory and language constructs that map efficiently to machine
        instructions, all with minimal runtime support. Despite its low-level
        capabilities, the language was designed to encourage cross-platform
        programming. A standards-compliant C program written with portability in
        mind can be compiled for a wide variety of computer platforms and
        operating systems with few changes to its source code.
      </p>
    </igc-expansion-panel>
  `,
};
