import {
  type CodeToHastOptions,
  createHighlighterCore,
  type HighlighterCore,
} from '@shikijs/core';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';

export class CodeHighlighter {
  private highlighterPromise: Promise<HighlighterCore>;

  constructor(
    public langs: Promise<any>[],
    public themes: Promise<any>[],
    engine = createJavaScriptRegexEngine()
  ) {
    this.highlighterPromise = createHighlighterCore({
      langs,
      themes,
      engine,
    });
  }

  async highlight(code: string, lang: string): Promise<string> {
    const highlighter = await this.highlighterPromise;
    const resolvedLang = highlighter.getLoadedLanguages().includes(lang)
      ? lang
      : 'text';
    const loadedThemes = highlighter.getLoadedThemes();

    if (!loadedThemes?.length) return code;

    let options: CodeToHastOptions<string, string>;
    if (loadedThemes.length === 1) {
      options = {
        lang: resolvedLang,
        theme: loadedThemes[0],
      };
    } else {
      const [lightTheme, darkTheme] = loadedThemes;
      options = {
        lang: resolvedLang,
        themes: {
          light: lightTheme,
          dark: darkTheme,
        },
      };
    }

    return highlighter.codeToHtml(code, options);
  }
}

export function createMarkdownHighlighter(highlighter: CodeHighlighter) {
  return async function highlight(code: string, lang: string) {
    return await highlighter.highlight(code, lang);
  };
}
