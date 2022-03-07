export function replyAndReturn(
  message: string,
  main_function: any,
  clear: boolean = true
) {
  if (clear) {
    console.clear();
  }
  console.log(message);
  return main_function();
}
