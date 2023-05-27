export interface ISnippet {
  prefix: string;
  body: string[];
  description?: string;
  scope?: unknown;
}

export const USER_SNIPPETS: ISnippet[] = [
  {
    prefix: ',a',
    body: ['() => {}'],
  },
];
