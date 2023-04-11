export function formSubmitter(host: HTMLFormElement) {
  return function (callback?: (data: FormData) => void) {
    host.addEventListener(
      'submit',
      (ev) => {
        ev.preventDefault();
        if (callback) {
          callback(new FormData(host));
        }
      },
      { once: true }
    );

    host.requestSubmit();
  };
}
