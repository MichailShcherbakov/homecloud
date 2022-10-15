export function setAsyncTimeout(cb: () => void, timeout: number) {
  let timer: NodeJS.Timeout;
  return new Promise((r) => {
    timer = setTimeout(() => {
      cb();
      r(undefined);
    }, timeout);
  }).then(() => {
    clearTimeout(timer);
  });
}

export function setSyncTimeout(cb: () => void, timeout: number) {
  const timer = setTimeout(cb, timeout);
  return () => clearTimeout(timer);
}
