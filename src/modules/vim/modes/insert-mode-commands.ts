export const insertModeCommands = [] as const;

export interface InsertModeKeybindings {
  key: string;
  command: typeof insertModeCommands[number];
}
