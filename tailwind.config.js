/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.tsx",
];
export const theme = {
  extend: {
    saturate: {
      25: '.25',
      75: '.75'
    }
  },
};
export const safelist = [
  "justify-start",
  "justify-end",
  "justify-stretch",
  "justify-between",
  "justify-center",
  "content-normal",
  "content-center",
  "content-end",
  "content-between",
  "content-around",
  "content-stretch",
  "gap-1", "gap-2", "gap-3", "gap-4", "gap-5", "gap-6", "gap-7", "gap-8",
  "w-1/6", "w-2/6", "w-3/6", "w-4/6", "w-5/6", "w-6/6",
];
export const plugins = [];
