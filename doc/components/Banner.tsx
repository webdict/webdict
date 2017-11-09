import * as React from 'react';

export default function Banner(props: { head: string, text: string, done: boolean }) {
  return (
    <div className={props.done ? 'fea-done' : 'fea-view'} title="双击或选择">
      <h2 className="fea-head">{props.head}</h2>
      <p className="fea-text">{props.text}</p>
    </div>
  );
}