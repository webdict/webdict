import * as React from 'react';

export default function ButtonGroup(props: any) {
  return (<div className="btn-group">
    {props.buttons.map((button, index) => <a key={index} className="btn" href={button.href}>{button.text}</a>)}
  </div>);
}