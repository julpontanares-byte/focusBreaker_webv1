declare const process: {
  cwd(): string
  env: Record<string, string | undefined>
}

declare module 'fs' {
  export const promises: {
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
    readFile(path: string, encoding: string): Promise<string>
    writeFile(path: string, data: string, encoding: string): Promise<void>
    rm(path: string, options?: { force?: boolean }): Promise<void>
  }
}

declare module 'path' {
  export function join(...parts: string[]): string
  export function dirname(path: string): string
}
