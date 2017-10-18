export interface BaseEntry {
  trans?: string; // when: 1. not exist => [Not Found]
  poses: string[]; // must directly return from server.
  count: number; // must directly return from server

  next?: string;
  link?: { href: string, title: string, html: string, color?: string };
}

export interface ServerEntry extends BaseEntry {
  // from server:
  family?: Array<number | string>; // when: 1. length===1, not exist; 2. cleng, number[]; 3. !cleng, string[];
  qword?: string; // when cleng: not exist
  cleng?: number; // when English: not exist
}

export interface Entry extends ServerEntry {
  family?: string[];
  index: number;
  trans: string;
  qword: string;
}
