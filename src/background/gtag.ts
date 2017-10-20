type Param = { [key: string]: any, 'event_callback'?: (event: any) => void };

declare const gtag: (event: 'event', eventName: string, param: Param) => void;

export default function (action: string, data: Param) {
  // data.event_callback = (event: any) => {
  //   console.log(event);
  //   console.log('gtag', data);
  // }
  if (gtag) gtag('event', action, data);
}
