import type { SvgIcon } from './registry/types.js';

export const internalIcons = new Map<string, SvgIcon>(
  Object.entries({
    navigate_before: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.61 7.41L14.2 6l-6 6 6 6 1.41-1.41L11.03 12l4.58-4.59z"/></svg>`,
    },
    navigate_next: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6-6-6z"/></svg>`,
    },
    keyboard_arrow_up: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`,
    },
    keyboard_arrow_down: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
    },
    keyboard_arrow_right: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
    },
    keyboard_arrow_left: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>`,
    },
    chip_cancel: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`,
    },
    chip_select: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
    },
    star: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M0 0h24v24H0z" fill="none"/><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
    },
    star_border: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    },
    case_sensitive: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path d="M21.2 16.5c0-.2-.1-.5-.1-.7v-4.4c0-.4-.1-.8-.3-1.2-.2-.3-.5-.6-.8-.7-.3-.2-.7-.3-1.1-.3-.4-.1-.8-.1-1.2-.1-.5 0-.9 0-1.4.1-.4.1-.8.3-1.2.5-.3.2-.6.5-.8.9s-.3.9-.3 1.3h1.4c0-.5.2-1 .7-1.3.5-.2 1-.4 1.5-.3.2 0 .5 0 .7.1.2 0 .4.1.6.2.2.1.3.2.5.4.1.2.2.5.2.7s-.1.4-.2.6c-.2.2-.4.3-.6.3-.3.1-.6.1-.9.2-.4 0-.7.1-1.1.2-.4.1-.7.1-1.1.2-.3.1-.7.2-1 .4s-.5.5-.7.8c-.2.4-.3.8-.3 1.2s.1.8.2 1.1c.1.3.4.5.6.7.3.2.6.3.9.4.9.2 1.9.2 2.8-.2.5-.2 1-.6 1.4-1 0 .4.1.7.3 1 .2.2.6.3.9.3.4 0 .7-.1 1-.2v-1.1c-.1 0-.3.1-.4.1-.1.1-.2 0-.2-.2zm-1.5-1.7c0 .2-.1.4-.2.6-.1.2-.3.5-.5.6-.2.2-.5.4-.8.5-.4.1-.8.2-1.2.2-.2 0-.4 0-.6-.1-.2 0-.4-.1-.5-.2-.2-.1-.3-.2-.4-.4-.1-.2-.2-.4-.1-.6 0-.3.1-.6.2-.8.2-.2.4-.4.6-.5.3-.1.6-.2.9-.2s.7-.1 1-.1.6-.1.9-.1.5-.1.7-.3v1.4zm-9.6-.4l1.3 3.6h1.8L8.5 6H6.7L2 18h1.7L5 14.4h5.1zm-2.5-7l2.1 5.5H5.5l2.1-5.5z"></path></svg>`,
    },
    clear: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    },
    arrow_drop_up: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14l5-5 5 5z"/></svg>`,
    },
    arrow_drop_down: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/></svg>`,
    },
    arrow_back: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`,
    },
    arrow_forward: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>`,
    },
    arrow_downward: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>`,
    },
    arrow_upward: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>`,
    },
    calendar: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>`,
    },
    calendar_today: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`,
    },
    expand_content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z"/></svg>`,
    },
    collapse_content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z"/></svg>`,
    },
    fullscreen: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>`,
    },
    fullscreen_exit: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/></svg>`,
    },
    indigo_clear: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M14.8144 11.9896L18.4171 8.39087C18.7818 8.0135 18.9836 7.50809 18.9791 6.98347C18.9745 6.45885 18.764 5.95699 18.3927 5.58602C18.0215 5.21504 17.5192 5.00464 16.9942 5.00008C16.4692 4.99552 15.9635 5.19718 15.5858 5.56166L11.9896 9.15372L8.39335 5.56166C8.01571 5.19718 7.50992 4.99552 6.98492 5.00008C6.45992 5.00464 5.95769 5.21505 5.58645 5.58602C5.2152 5.95699 5.00464 6.45885 5.00008 6.98347C4.99551 7.50809 5.19733 8.0135 5.56207 8.39087L9.18561 12.0104L5.58291 15.6091C5.21817 15.9865 5.01635 16.4919 5.02091 17.0165C5.02548 17.5412 5.23604 18.043 5.60729 18.414C5.97853 18.785 6.48075 18.9954 7.00576 18.9999C7.53076 19.0045 8.03654 18.8028 8.41419 18.4383L12.0104 14.8463L15.6067 18.4383C15.9843 18.8028 16.4901 19.0045 17.0151 18.9999C17.5401 18.9954 18.0423 18.785 18.4136 18.414C18.7848 18.043 18.9954 17.5412 18.9999 17.0165C19.0045 16.4919 18.8027 15.9865 18.4379 15.6091L14.8144 11.9896Z"/>
</svg>`,
    },
    indigo_unfold_more: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M13.2403 2.52848C12.9114 2.1902 12.4652 2.0001 12 2C11.5348 2.0001 11.0886 2.1902 10.7597 2.52848L6.49245 6.94326C6.17289 7.28344 5.99607 7.73906 6.00007 8.21198C6.00406 8.6849 6.18855 9.13731 6.51381 9.47173C6.83907 9.80615 7.27909 9.99582 7.73907 9.99993C8.19904 10.004 8.64218 9.82225 8.97305 9.49369L12 6.35412L15.0269 9.49369C15.3578 9.82225 15.801 10.004 16.2609 9.99993C16.7209 9.99582 17.1609 9.80615 17.4862 9.47173C17.8115 9.13731 17.9959 8.6849 17.9999 8.21198C18.0039 7.73906 17.8271 7.28344 17.5076 6.94326L13.2403 2.52848Z"/>
<path d="M10.7597 21.4715C11.0886 21.8098 11.5348 21.9999 12 22C12.4652 21.9999 12.9114 21.8098 13.2403 21.4715L17.5076 17.0567C17.8271 16.7166 18.0039 16.2609 17.9999 15.788C17.9959 15.3151 17.8115 14.8627 17.4862 14.5283C17.1609 14.1939 16.7209 14.0042 16.2609 14.0001C15.801 13.996 15.3578 14.1778 15.0269 14.5063L12 17.6459L8.97305 14.5063C8.64218 14.1778 8.19904 13.996 7.73907 14.0001C7.27909 14.0042 6.83907 14.1939 6.51381 14.5283C6.18855 14.8627 6.00406 15.3151 6.00007 15.788C5.99607 16.2609 6.17289 16.7166 6.49245 17.0567L10.7597 21.4715Z"/>
</svg>`,
    },
    indigo_unfold_less: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M10.7597 9.47152C11.0886 9.8098 11.5348 9.9999 12 10C12.4652 9.9999 12.9114 9.8098 13.2403 9.47152L17.5076 5.05674C17.8271 4.71656 18.0039 4.26094 17.9999 3.78802C17.9959 3.3151 17.8115 2.86269 17.4862 2.52827C17.1609 2.19385 16.7209 2.00418 16.2609 2.00007C15.801 1.99596 15.3578 2.17775 15.0269 2.50631L12 5.64588L8.97305 2.50631C8.64218 2.17775 8.19904 1.99596 7.73907 2.00007C7.27909 2.00418 6.83907 2.19386 6.51381 2.52828C6.18855 2.8627 6.00406 3.3151 6.00007 3.78802C5.99607 4.26095 6.17289 4.71656 6.49245 5.05674L10.7597 9.47152Z"/>
<path d="M13.2403 14.5285C12.9114 14.1902 12.4652 14.0001 12 14C11.5348 14.0001 11.0886 14.1902 10.7597 14.5285L6.49245 18.9433C6.17289 19.2834 5.99607 19.7391 6.00007 20.212C6.00406 20.6849 6.18855 21.1373 6.51381 21.4717C6.83907 21.8061 7.27909 21.9958 7.73907 21.9999C8.19904 22.004 8.64218 21.8222 8.97305 21.4937L12 18.3541L15.0269 21.4937C15.3578 21.8222 15.801 22.004 16.2609 21.9999C16.7209 21.9958 17.1609 21.8061 17.4862 21.4717C17.8115 21.1373 17.9959 20.6849 17.9999 20.212C18.0039 19.7391 17.8271 19.2834 17.5076 18.9433L13.2403 14.5285Z"/>
</svg>`,
    },
    indigo_arrow_forward: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M4.00085 11.9436C3.99347 12.178 4.034 12.4115 4.12005 12.6303C4.20609 12.849 4.33589 13.0484 4.50174 13.2168C4.66758 13.3851 4.8661 13.519 5.0855 13.6103C5.30489 13.7017 5.54069 13.7487 5.7789 13.7486H14.136L11.6165 16.1733L11.5898 16.1996C11.2817 16.5108 11.1117 16.9297 11.117 17.3643C11.1224 17.7989 11.3026 18.2137 11.6183 18.5175C11.9413 18.8269 12.3741 19 12.8247 19C13.2753 19 13.7081 18.8269 14.0311 18.5175L19.5004 13.2234C19.6586 13.0703 19.7843 12.8878 19.8701 12.6864C19.9559 12.485 20 12.2688 20 12.0504V11.9576C20.0002 11.7387 19.9561 11.5219 19.8703 11.3199C19.7846 11.1179 19.6588 10.9348 19.5004 10.7811L14.0311 5.48876C13.8672 5.32979 13.6726 5.20469 13.4589 5.12081C13.2451 5.03693 13.0165 4.99596 12.7865 5.00031C12.3501 5.01251 11.9346 5.18704 11.6236 5.48876L11.5952 5.51677C11.2855 5.82747 11.1138 6.24653 11.1178 6.68184C11.1218 7.11714 11.3012 7.53307 11.6165 7.83821L14.12 10.2472L5.7789 10.2472C5.31673 10.247 4.87263 10.4239 4.54073 10.7406C4.20882 11.0573 4.01518 11.4888 4.00085 11.9436Z"/>
</svg>`,
    },
    indigo_arrow_back: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M18.229 13.7483H9.87121L12.3839 16.1672L12.4106 16.1952C12.5638 16.3492 12.6846 16.5315 12.7662 16.7316C12.8478 16.9316 12.8885 17.1455 12.8861 17.361C12.8836 17.5766 12.8379 17.7895 12.7518 17.9877C12.6656 18.1859 12.5406 18.3654 12.3839 18.516C12.0608 18.8263 11.6272 19 11.1757 19C10.7242 19 10.2906 18.8263 9.9675 18.516L4.4996 13.2197C4.3412 13.0668 4.21543 12.8843 4.12963 12.683C4.04384 12.4816 3.99978 12.2654 4 12.0471L4 11.9543C3.9998 11.7354 4.04385 11.5187 4.12963 11.3168C4.21542 11.1148 4.34117 10.9317 4.4996 10.7782L9.9675 5.48717C10.2904 5.17494 10.7249 5 11.1775 5C11.6301 5 12.0646 5.17494 12.3874 5.48717L12.4106 5.51163C12.564 5.66543 12.6851 5.84754 12.767 6.04746C12.8489 6.24737 12.8899 6.46121 12.8878 6.67675C12.8857 6.8923 12.8404 7.10529 12.7545 7.30359C12.6687 7.50189 12.5439 7.68161 12.3874 7.83242L9.87832 10.2479L18.2219 10.2479C18.6935 10.2479 19.1458 10.4323 19.4792 10.7605C19.8127 11.0887 20 11.5339 20 11.9981C20 12.4623 19.8127 12.9074 19.4792 13.2356C19.1458 13.5638 18.6935 13.7483 18.2219 13.7483H18.229Z"/>
</svg>`,
    },
    indigo_arrow_downward: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M12.0564 4.00085C11.822 3.99347 11.5885 4.034 11.3697 4.12005C11.151 4.20609 10.9516 4.33589 10.7832 4.50174C10.6149 4.66758 10.481 4.8661 10.3897 5.0855C10.2983 5.30489 10.2513 5.54069 10.2514 5.7789V14.136L7.82669 11.6165L7.80043 11.5898C7.48918 11.2817 7.07026 11.1117 6.63567 11.117C6.20107 11.1224 5.78632 11.3026 5.48249 11.6183C5.17311 11.9413 5 12.3741 5 12.8247C5 13.2753 5.17311 13.7081 5.48249 14.0311L10.7766 19.5004C10.9297 19.6586 11.1122 19.7843 11.3136 19.8701C11.515 19.9559 11.7312 20 11.9496 20H12.0424C12.2613 20.0002 12.4781 19.9561 12.6801 19.8703C12.8821 19.7846 13.0652 19.6588 13.2189 19.5004L18.5112 14.0311C18.6702 13.8672 18.7953 13.6726 18.8792 13.4589C18.9631 13.2451 19.004 13.0165 18.9997 12.7865C18.9875 12.3501 18.813 11.9346 18.5112 11.6236L18.4832 11.5952C18.1725 11.2855 17.7535 11.1138 17.3182 11.1178C16.8829 11.1218 16.4669 11.3012 16.1618 11.6165L13.7528 14.12V5.7789C13.753 5.31673 13.5761 4.87263 13.2594 4.54073C12.9427 4.20882 12.5112 4.01518 12.0564 4.00085Z"/>
</svg>`,
    },
    indigo_arrow_upward: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M10.2517 18.229V9.87121L7.83279 12.3839L7.80481 12.4106C7.65078 12.5638 7.46849 12.6846 7.26845 12.7662C7.0684 12.8478 6.85454 12.8885 6.63899 12.8861C6.42344 12.8836 6.21049 12.8379 6.01231 12.7518C5.81414 12.6656 5.63459 12.5406 5.48402 12.3839C5.17367 12.0608 5 11.6272 5 11.1757C5 10.7242 5.17367 10.2906 5.48402 9.9675L10.7803 4.4996C10.9332 4.3412 11.1157 4.21543 11.317 4.12963C11.5184 4.04384 11.7346 3.99978 11.9529 4H12.0457C12.2646 3.9998 12.4813 4.04385 12.6832 4.12963C12.8852 4.21542 13.0683 4.34117 13.2218 4.4996L18.5128 9.9675C18.8251 10.2904 19 10.7249 19 11.1775C19 11.6301 18.8251 12.0646 18.5128 12.3874L18.4884 12.4106C18.3346 12.564 18.1525 12.6851 17.9525 12.767C17.7526 12.8489 17.5388 12.8899 17.3232 12.8878C17.1077 12.8857 16.8947 12.8404 16.6964 12.7545C16.4981 12.6687 16.3184 12.5439 16.1676 12.3874L13.7521 9.87832V18.2219C13.7521 18.6935 13.5677 19.1458 13.2395 19.4792C12.9113 19.8127 12.4661 20 12.0019 20C11.5377 20 11.0926 19.8127 10.7644 19.4792C10.4362 19.1458 10.2517 18.6935 10.2517 18.2219V18.229Z"/>
</svg>`,
    },
    indigo_chevron_down: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M12 17C11.5348 16.9999 11.0886 16.8098 10.7597 16.4715L5.49245 11.0567C5.17289 10.7166 4.99607 10.2609 5.00007 9.78802C5.00406 9.3151 5.18855 8.86269 5.51381 8.52827C5.83907 8.19385 6.27909 8.00418 6.73907 8.00007C7.19904 7.99596 7.64218 8.17775 7.97305 8.50631L12 12.6459L16.027 8.50631C16.3578 8.17775 16.801 7.99596 17.2609 8.00007C17.7209 8.00418 18.1609 8.19386 18.4862 8.52827C18.8115 8.86269 18.9959 9.3151 18.9999 9.78802C19.0039 10.2609 18.8271 10.7166 18.5076 11.0567L13.2403 16.4715C12.9114 16.8098 12.4652 16.9999 12 17Z"/>
</svg>`,
    },
    indigo_chevron_up: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M12 7.00001C12.4629 7.00011 12.9069 7.18943 13.2342 7.52633L18.467 12.9116C18.6338 13.0773 18.7668 13.2755 18.8583 13.4947C18.9498 13.7138 18.9979 13.9496 18.9999 14.1881C19.0019 14.4266 18.9578 14.6632 18.87 14.8839C18.7822 15.1047 18.6526 15.3052 18.4887 15.4739C18.3247 15.6425 18.1299 15.7759 17.9153 15.8662C17.7008 15.9565 17.4709 16.002 17.2391 15.9999C17.0073 15.9979 16.7783 15.9483 16.5653 15.8542C16.3523 15.76 16.1596 15.6232 15.9986 15.4516L12 11.3363L8.00135 15.4516C7.84032 15.6232 7.64771 15.76 7.43472 15.8542C7.22174 15.9483 6.99265 15.9979 6.76085 15.9999C6.52906 16.002 6.29918 15.9565 6.08463 15.8662C5.87009 15.7759 5.6752 15.6425 5.51129 15.4739C5.34738 15.3052 5.21778 15.1047 5.13 14.8839C5.04223 14.6632 4.99805 14.4266 5.00007 14.1881C5.00208 13.9496 5.05023 13.7138 5.14172 13.4947C5.23321 13.2755 5.36619 13.0773 5.53292 12.9116L10.7658 7.52633C10.9274 7.35895 11.1198 7.22625 11.3316 7.1359C11.5435 7.04556 11.7706 6.99937 12 7.00001Z"/>
</svg>`,
    },
    indigo_chevron_right: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M17 12C16.9999 12.4652 16.8098 12.9114 16.4715 13.2403L11.0567 18.5076C10.7166 18.8271 10.2609 19.0039 9.78802 18.9999C9.3151 18.9959 8.86269 18.8115 8.52827 18.4862C8.19385 18.1609 8.00418 17.7209 8.00007 17.2609C7.99596 16.801 8.17775 16.3578 8.50631 16.027L12.6459 12L8.50631 7.97305C8.17775 7.64218 7.99596 7.19904 8.00007 6.73907C8.00418 6.27909 8.19385 5.83907 8.52827 5.51381C8.86269 5.18855 9.3151 5.00406 9.78802 5.00007C10.2609 4.99607 10.7166 5.17289 11.0567 5.49245L16.4715 10.7597C16.8098 11.0886 16.9999 11.5348 17 12Z"/>
</svg>`,
    },
    indigo_chevron_left: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M7.00001 12C7.00011 11.5371 7.18943 11.0931 7.52633 10.7658L12.9116 5.53297C13.0773 5.36624 13.2755 5.23321 13.4947 5.14172C13.7138 5.05023 13.9496 5.00208 14.1881 5.00007C14.4266 4.99805 14.6632 5.04223 14.8839 5.13C15.1047 5.21778 15.3052 5.34743 15.4739 5.51134C15.6425 5.67525 15.7759 5.87015 15.8662 6.08469C15.9565 6.29923 16.002 6.52911 15.9999 6.7609C15.9979 6.9927 15.9483 7.22174 15.8542 7.43472C15.76 7.64771 15.6232 7.84037 15.4516 8.00141L11.3363 12L15.4516 15.9986C15.6232 16.1597 15.76 16.3523 15.8542 16.5653C15.9483 16.7783 15.9979 17.0074 15.9999 17.2391C16.002 17.4709 15.9565 17.7008 15.8662 17.9154C15.7759 18.1299 15.6425 18.3248 15.4739 18.4887C15.3052 18.6526 15.1047 18.7822 14.8839 18.87C14.6632 18.9578 14.4266 19.0019 14.1881 18.9999C13.9496 18.9979 13.7138 18.9498 13.4947 18.8583C13.2755 18.7668 13.0773 18.6338 12.9116 18.4671L7.52633 13.2342C7.35895 13.0726 7.22625 12.8802 7.1359 12.6684C7.04556 12.4565 6.99937 12.2294 7.00001 12Z"/>
</svg>`,
    },
    indigo_check: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
<path d="M19.0329 5.00008C18.7694 4.99771 18.5081 5.04833 18.2646 5.14892C18.0211 5.2495 17.8003 5.39801 17.6153 5.5856L9.136 14.1629L6.38271 11.3931C6.19957 11.2083 5.98158 11.0615 5.74134 10.9613C5.5011 10.8612 5.24337 10.8096 4.98307 10.8096C4.72276 10.8096 4.46503 10.8612 4.22479 10.9613C3.98455 11.0615 3.76656 11.2083 3.58343 11.3931C3.2098 11.7677 3 12.2751 3 12.804C3 13.3329 3.2098 13.8402 3.58343 14.2148L7.73836 18.4113C7.92066 18.5977 8.13838 18.7458 8.37874 18.8468C8.61909 18.9479 8.87723 19 9.138 19C9.39876 19 9.6569 18.9479 9.89726 18.8468C10.1376 18.7458 10.3553 18.5977 10.5376 18.4113L20.4166 8.42125C20.7902 8.04667 21 7.53933 21 7.01042C21 6.48151 20.7902 5.97417 20.4166 5.59958C20.2368 5.41354 20.022 5.26481 19.7846 5.16193C19.5471 5.05905 19.2917 5.00405 19.0329 5.00008Z"/>
</svg>`,
    },
    error: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>`,
    },
    indigo_access_time: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M10.5 8a1.5 1.5 0 0 1 3 0v2.5H16a1.5 1.5 0 1 1 0 3h-4a1.5 1.5 0 0 1-1.5-1.5V8Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22 12c0 5.523-4.476 10-10 10-5.522 0-10-4.477-10-10S6.479 2 12 2c5.524 0 10 4.477 10 10Zm-3 0a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>`,
    },
    indigo_add: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M10.2 13.8H5.8a1.8 1.8 0 0 1 0-3.6h4.4V5.8a1.8 1.8 0 1 1 3.6 0v4.4h4.4a1.8 1.8 0 0 1 0 3.6h-4.4v4.4a1.8 1.8 0 1 1-3.6 0v-4.4Z"/></svg>`,
    },
    indigo_attach_file: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="m16.496 10.809-7.63 7.365a.965.965 0 0 1-1.31 0 .844.844 0 0 1 0-1.24l6.59-6.382c.601-.601.59-1.55-.032-2.14a1.689 1.689 0 0 0-2.261-.03l-.033.03-6.558 6.351c-1.629 1.542-1.629 4.04 0 5.581 1.629 1.541 4.27 1.541 5.899 0l7.63-7.365c2.533-2.397 2.533-6.284 0-8.681-2.535-2.397-6.642-2.397-9.176 0L4.008 9.749l-.033.031a1.477 1.477 0 0 0 0 2.17 1.688 1.688 0 0 0 2.326-.03l5.608-5.452c1.267-1.198 3.32-1.198 4.587 0a2.954 2.954 0 0 1 0 4.34Z"/></svg>`,
    },
    indigo_block: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M19.248 4.787c-.006-.007-.008-.014-.014-.02-.007-.007-.014-.009-.02-.015A10.232 10.232 0 0 0 4.751 19.213c.006.007.008.016.014.02.006.006.014.009.02.015A10.232 10.232 0 0 0 19.249 4.787ZM12 4.327c1.592 0 3.145.498 4.44 1.425L5.751 16.44A7.66 7.66 0 0 1 12 4.326Zm0 15.347a7.623 7.623 0 0 1-4.44-1.426L18.249 7.56A7.661 7.661 0 0 1 12 19.674Z"/></svg>`,
    },
    indigo_calendar_today: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M18.299 4H17v-.5a1.5 1.5 0 1 0-3 0V4h-4v-.5a1.5 1.5 0 1 0-3 0V4H5.703A3.707 3.707 0 0 0 2 7.702v10.595A3.707 3.707 0 0 0 5.703 22h12.596A3.706 3.706 0 0 0 22 18.297V7.702A3.707 3.707 0 0 0 18.299 4ZM5.703 7H7v.5a1.5 1.5 0 0 0 3 0V7h4v.5a1.5 1.5 0 0 0 3 0V7h1.298a.704.704 0 0 1 .702.702v2.655H5V7.703A.703.703 0 0 1 5.703 7Zm12.596 12H5.703A.704.704 0 0 1 5 18.297v-4.94h14v4.94a.704.704 0 0 1-.702.703Z"/></svg>`,
    },
    indigo_cancel: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.524 0 10-4.477 10-10 0-5.522-4.476-10-10-10C6.479 2 2 6.478 2 12c0 5.523 4.478 10 10 10ZM7.438 9.543a1.49 1.49 0 0 1 2.106-2.106l2.458 2.457 2.457-2.457a1.489 1.489 0 1 1 2.106 2.106L14.107 12l2.457 2.457a1.49 1.49 0 0 1-2.106 2.107l-2.457-2.458-2.458 2.458a1.489 1.489 0 1 1-2.106-2.107L9.894 12 7.437 9.543Z"/></svg>`,
    },
    indigo_check_circle: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.445 3.685a10 10 0 1 1 11.111 16.63A10 10 0 0 1 6.445 3.685Zm10.22 3.923a1.294 1.294 0 0 0-.523-.108 1.294 1.294 0 0 0-.947.424l-4.761 5.131-1.626-1.703a1.297 1.297 0 0 0-1.911 0c-.254.27-.396.632-.396 1.009 0 .376.142.738.396 1.008l2.59 2.712c.124.133.272.238.436.31a1.29 1.29 0 0 0 1.473-.31l3.547-3.815 2.162-2.33c.254-.27.396-.632.396-1.008 0-.377-.142-.738-.396-1.01a1.325 1.325 0 0 0-.44-.31Z"/></svg>`,
    },
    indigo_error: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.685 17.556a10 10 0 1 1 16.63-11.112 10 10 0 0 1-16.63 11.112ZM10.5 11.5v-4a1.5 1.5 0 1 1 3 0v4a1.5 1.5 0 1 1-3 0Zm.253 5.833a1.5 1.5 0 1 1 2.495-1.667 1.5 1.5 0 0 1-2.495 1.667Z"/></svg>`,
    },
    indigo_file_download: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M10.41 11.21V3.616c0-.43.167-.84.466-1.144A1.578 1.578 0 0 1 12 2c.422 0 .826.17 1.125.473.298.304.466.715.466 1.144v7.586l2.195-2.282a1.49 1.49 0 0 1 1.05-.455 1.47 1.47 0 0 1 1.06.434l.022.021c.284.294.443.689.443 1.1 0 .412-.16.807-.443 1.1l-4.81 4.972a1.496 1.496 0 0 1-1.069.454h-.084a1.47 1.47 0 0 1-1.066-.454L6.076 11.12a1.586 1.586 0 0 1-.44-1.098c0-.41.158-.805.44-1.098a1.49 1.49 0 0 1 1.05-.457 1.47 1.47 0 0 1 1.06.432l.025.025 2.199 2.284Z"/><path d="M20.41 14.729a1.59 1.59 0 0 0-1.592 1.591v1.613a.886.886 0 0 1-.884.884H6.07a.892.892 0 0 1-.89-.884V16.32a1.591 1.591 0 0 0-3.181 0v1.618A4.087 4.087 0 0 0 6.066 22h11.868A4.07 4.07 0 0 0 22 17.931V16.32a1.59 1.59 0 0 0-1.59-1.591Z"/></svg>`,
    },
    indigo_file_upload: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M13.59 14.927v-7.59L15.79 9.62l.026.024a1.489 1.489 0 0 0 1.06.432 1.473 1.473 0 0 0 1.05-.456c.281-.294.439-.688.439-1.098 0-.41-.158-.805-.44-1.099l-4.814-4.97A1.49 1.49 0 0 0 12.044 2h-.085a1.479 1.479 0 0 0-1.069.454l-4.81 4.97a1.582 1.582 0 0 0-.442 1.1c0 .412.16.806.443 1.1l.022.02a1.489 1.489 0 0 0 1.06.435 1.47 1.47 0 0 0 1.05-.455l2.195-2.28v7.583c0 .429.168.84.466 1.143.299.303.703.474 1.125.474.422 0 .827-.17 1.125-.474a1.63 1.63 0 0 0 .466-1.143Z"/><path d="M19.284 15.197A1.59 1.59 0 0 1 22 16.32v1.611A4.071 4.071 0 0 1 17.934 22H6.066A4.085 4.085 0 0 1 2 17.939V16.32a1.59 1.59 0 0 1 3.182 0v1.613a.892.892 0 0 0 .89.884h11.862a.886.886 0 0 0 .884-.884v-1.613c0-.422.168-.826.466-1.124Z"/></svg>`,
    },
    indigo_filter_list: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M4.616 7.682h14.768c.428 0 .84-.168 1.143-.466.303-.298.473-.703.473-1.125 0-.422-.17-.827-.473-1.125a1.63 1.63 0 0 0-1.143-.466H4.616c-.428 0-.84.168-1.143.466A1.579 1.579 0 0 0 3 6.091c0 .422.17.827.473 1.125a1.63 1.63 0 0 0 1.143.466ZM7.344 13.591h9.312c.429 0 .84-.168 1.143-.466.303-.299.474-.703.474-1.125 0-.422-.17-.827-.474-1.125a1.63 1.63 0 0 0-1.143-.466H7.344c-.429 0-.84.167-1.143.466A1.579 1.579 0 0 0 5.727 12c0 .422.17.827.474 1.125a1.63 1.63 0 0 0 1.143.466ZM13.929 19.5h-3.858a1.63 1.63 0 0 1-1.143-.466 1.578 1.578 0 0 1-.473-1.125c0-.422.17-.826.473-1.125a1.63 1.63 0 0 1 1.143-.466h3.858c.429 0 .84.167 1.143.466.303.298.474.703.474 1.125 0 .422-.17.827-.474 1.125a1.63 1.63 0 0 1-1.143.466Z"/></svg>`,
    },
    indigo_horizontal_rule: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M5.778 13.5h12.444c.471 0 .924-.184 1.257-.512.334-.329.521-.774.521-1.238 0-.464-.187-.91-.52-1.237A1.793 1.793 0 0 0 18.221 10H5.778c-.471 0-.924.184-1.257.513-.334.328-.521.773-.521 1.237 0 .464.187.91.52 1.238.334.328.787.512 1.258.512Z"/></svg>`,
    },
    indigo_info: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.686 6.944a10 10 0 1 0 16.63 11.112A10 10 0 0 0 3.685 6.944Zm6.815 5.556V17a1.5 1.5 0 0 0 3 0v-4.5a1.5 1.5 0 1 0-3 0Zm.253-5.333a1.5 1.5 0 1 0 2.494 1.666 1.5 1.5 0 0 0-2.494-1.666Z"/></svg>`,
    },
    indigo_menu: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M4.616 7.682h14.768c.428 0 .84-.168 1.143-.466.303-.299.473-.703.473-1.125 0-.422-.17-.827-.473-1.125a1.63 1.63 0 0 0-1.143-.466H4.616c-.428 0-.84.168-1.143.466A1.578 1.578 0 0 0 3 6.09c0 .422.17.826.473 1.125a1.63 1.63 0 0 0 1.143.466ZM4.616 13.59h14.768c.428 0 .84-.167 1.143-.465.303-.299.473-.703.473-1.125 0-.422-.17-.827-.473-1.125a1.63 1.63 0 0 0-1.143-.466H4.616c-.428 0-.84.167-1.143.466A1.578 1.578 0 0 0 3 12c0 .422.17.826.473 1.125a1.63 1.63 0 0 0 1.143.466ZM19.384 19.5H4.616a1.63 1.63 0 0 1-1.143-.466A1.578 1.578 0 0 1 3 17.909c0-.422.17-.826.473-1.125a1.63 1.63 0 0 1 1.143-.466h14.768c.428 0 .84.168 1.143.466.303.299.473.703.473 1.125 0 .422-.17.827-.473 1.125a1.63 1.63 0 0 1-1.143.466Z"/></svg>`,
    },
    indigo_pin: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.12 2.516A1.572 1.572 0 0 0 16.966 2H7.034c-.435 0-.85.187-1.154.516a1.814 1.814 0 0 0-.472 1.23c0 .46.168.902.472 1.23.304.33.72.516 1.154.516h.169v3.023a6.54 6.54 0 0 0-1.977 2.382c-.535 1.083-.782 2.444-.715 3.669.006.45.174.882.472 1.204.304.329.719.516 1.153.516h4.238v3.825c-.01.073-.015.147-.015.222 0 .92.735 1.667 1.641 1.667s1.64-.746 1.64-1.667c0-.075-.004-.15-.014-.222v-3.825h4.238c.434 0 .849-.187 1.153-.516.298-.322.466-.754.473-1.204.066-1.225-.181-2.586-.716-3.67a6.54 6.54 0 0 0-1.977-2.38V5.491h.17c.434 0 .849-.186 1.153-.515.304-.329.472-.772.472-1.23 0-.46-.168-.903-.472-1.231ZM8.005 12.114c-.114.169-.288.708-.288 1.076h8.566c0-.368-.174-.907-.289-1.076a2.738 2.738 0 0 0-1.051-.925 1.645 1.645 0 0 1-.764-.624 1.836 1.836 0 0 1-.304-1.016V5.095h-3.75V9.55c0 .364-.106.719-.304 1.016-.19.285-.456.503-.764.624-.417.205-.779.523-1.052.925Z"/></svg>`,
    },
    indigo_refresh: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path d="M14.068 3.247a9.05 9.05 0 0 0-8.98 2.925c-1.08 1.263-1.79 2.35-2.054 3.991a1.58 1.58 0 0 0-.034.315v.003A1.519 1.519 0 0 0 4.504 12a1.458 1.458 0 0 0 1.515-1.184l.002-.012.002-.012c.148-1.107.602-1.702 1.312-2.565a5.999 5.999 0 0 1 8.533-.75l-1.314 1.308a1.396 1.396 0 0 0-.314.445.761.761 0 0 0-.015.582.756.756 0 0 0 .418.406c.163.07.347.095.531.095H20.03A.985.985 0 0 0 21 9.348v-4.84c0-.323-.09-.772-.5-.94-.407-.17-.79.084-1.022.315l-1.45 1.444a9.05 9.05 0 0 0-3.96-2.08ZM3.977 13.687H3.97A.984.984 0 0 0 3 14.65v4.84c0 .324.09.773.499.942.408.17.79-.084 1.023-.315l1.45-1.444a9.049 9.049 0 0 0 12.94-.845c1.08-1.263 1.79-2.35 2.054-3.991.022-.104.033-.209.034-.315v-.003A1.518 1.518 0 0 0 19.496 12a1.458 1.458 0 0 0-1.513 1.184l-.002.012-.002.012c-.148 1.108-.602 1.702-1.312 2.565a6 6 0 0 1-8.535.75l1.314-1.308c.133-.132.246-.281.314-.445a.76.76 0 0 0 .015-.582.756.756 0 0 0-.418-.406 1.364 1.364 0 0 0-.531-.095h-4.85Z"/></svg>`,
    },
    indigo_search: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.393 3a7.393 7.393 0 1 0 4.068 13.567l3.996 3.997a1.49 1.49 0 1 0 2.107-2.107l-3.997-3.996A7.393 7.393 0 0 0 10.393 3ZM6 10.393a4.393 4.393 0 1 1 8.786 0 4.393 4.393 0 0 1-8.786 0Z"></svg>`,
    },
    indigo_send: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.302 10.84S5.5 2.591 4.352 2.13C3.207 1.666 3 2.59 3 2.59v17.791c0 .277.077.549.223.79.146.242.356.444.611.589a1.871 1.871 0 0 0 1.708.064l14.5-8.216c.29-.136.533-.343.702-.6.17-.256.258-.551.256-.851a1.528 1.528 0 0 0-.267-.85 1.672 1.672 0 0 0-.431-.433v-.035ZM6.5 10.021V6.803l9.5 5.385-9.5 5.555v-3.146l3.583-.645.036-.01a1.76 1.76 0 0 0 .913-.572 1.54 1.54 0 0 0 .361-.964 1.535 1.535 0 0 0-.336-.972 1.753 1.753 0 0 0-.898-.593l-.034-.01-3.625-.81Z"/></svg>`,
    },
    indigo_unpin: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.474 19.223a1.633 1.633 0 0 0 0 2.3 1.614 1.614 0 0 0 2.29 0l5.11-5.105v3.693c-.01.073-.015.147-.015.222 0 .92.735 1.667 1.641 1.667s1.64-.746 1.64-1.667a1.77 1.77 0 0 0-.014-.222v-3.825h4.237c.435 0 .85-.187 1.154-.516.298-.322.466-.754.472-1.204.067-1.225-.18-2.586-.715-3.67A6.66 6.66 0 0 0 17.09 9.21l4.436-4.432a1.633 1.633 0 0 0 0-2.3 1.614 1.614 0 0 0-2.29 0L2.474 19.223Zm12.381-7.781-1.75 1.748h2.678c0-.368-.174-.907-.288-1.076a2.798 2.798 0 0 0-.64-.672Z"/><path d="M12.614 5.095h-2.99v2.986l-5.609 5.605c.061-.969.302-1.96.71-2.79a6.54 6.54 0 0 1 1.978-2.38V5.491h-.17c-.434 0-.849-.186-1.153-.515a1.814 1.814 0 0 1-.472-1.23c0-.46.168-.903.472-1.231A1.572 1.572 0 0 1 6.534 2h9.178l-3.098 3.095Z"/></svg>`,
    },
  })
);
