export function makeFormHandlers(host: HTMLFormElement) {
  const opts = { once: true };
  return {
    submit: (callback: (data: FormData) => void) => {
      host.addEventListener(
        'submit',
        (e) => {
          e.preventDefault();
          callback(new FormData(host));
        },
        opts
      );
      host.requestSubmit();
    },
    reset: (callback: (data: FormData) => void) => {
      host.addEventListener('reset', () => callback(new FormData(host)), opts);
      host.reset();
    },
  };
}
