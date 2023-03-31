import { capitalizeFirstLetter } from "../../utils/misc";

export function show(): void {
  $("#typingTest #layoutfluidTimer").stop(true, true).animate(
    {
      opacity: 1,
    },
    125
  );
}

export function hide(): void {
  $("#typingTest #layoutfluidTimer").stop(true, true).animate(
    {
      opacity: 0,
    },
    125
  );
}

export function update(sec: number, layout: string): void {
  $("#typingTest #layoutfluidTimer").text(
    `${capitalizeFirstLetter(layout)} in: ${sec}s`
  );
}
