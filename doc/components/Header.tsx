import * as React from 'react';
import ButtonGroup from './ButtonGroup';

export default function Header(props: { head: string, disc: string, buttons: { text: string, href: string }[] }) {
  return (
    <section className="page-header">
      <h1 className="project-name">{props.head}</h1>
      <h2 className="project-tagline">{props.disc}</h2>
      <ButtonGroup buttons={props.buttons} />
    </section>
  );
}