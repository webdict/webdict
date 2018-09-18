function secondString(second: number, mark = ' AGO') {
  if (second <= 0) return mark;
  return second + 'S AGO';
}

function minuteString(minute: number) {
  if (minute <= 0) return '';
  return minute + 'M';
}

export default function timeAgo(stamp: number) {
  let second = Math.round(Date.now() / 1000 - stamp);
  if (second < 60) return secondString(second, 'NOW');
  let minute = Math.round(second / 60);
  second %= 60;
  if (minute < 60) return minuteString(minute) + secondString(second);
  const hour = Math.round(minute / 60);
  minute %= 60;
  return hour + 'H' + minuteString(minute) + secondString(second);
}

