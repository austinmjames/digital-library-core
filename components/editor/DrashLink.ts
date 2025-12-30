import { InputRule, Mark, mergeAttributes } from "@tiptap/core";

/**
 * DrashLink Tiptap Extension (v1.1 - Strict Types)
 * Filepath: components/editor/DrashLink.ts
 * Role: Custom mark to detect and link "+Ref" syntax to DrashX library.
 * Alignment: PRD Section 2.3 - "Bi-directional linking (+Ref syntax)".
 */

export interface DrashLinkOptions {
  /**
   * Custom HTML attributes for the rendered link.
   */
  HTMLAttributes: Record<string, string | number | boolean | undefined>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    drashLink: {
      /**
       * Set a DrashLink
       */
      setDrashLink: (attributes: { ref: string }) => ReturnType;
      /**
       * Toggle a DrashLink
       */
      toggleDrashLink: (attributes: { ref: string }) => ReturnType;
      /**
       * Unset a DrashLink
       */
      unsetDrashLink: () => ReturnType;
    };
  }
}

export const DrashLink = Mark.create<DrashLinkOptions>({
  name: "drashLink",

  addOptions() {
    return {
      HTMLAttributes: {
        class:
          "drash-ref-link text-orange-600 font-bold hover:underline cursor-pointer bg-orange-50 px-1 rounded transition-colors",
      },
    };
  },

  addAttributes() {
    return {
      ref: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-ref"),
        renderHTML: (attributes) => {
          if (!attributes.ref) {
            return {};
          }
          return {
            "data-ref": attributes.ref,
            href: `/read/${attributes.ref}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[data-ref]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setDrashLink:
        (attributes) =>
        ({ chain }) => {
          return chain().setMark(this.name, attributes).run();
        },
      toggleDrashLink:
        (attributes) =>
        ({ chain }) => {
          return chain().toggleMark(this.name, attributes).run();
        },
      unsetDrashLink:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },

  /**
   * Input rules to detect "+Ref" pattern (e.g. +Genesis.1.1)
   * Regex breakdown:
   * \+ : Starts with plus
   * ([A-Za-z_]+) : Book Name (Group 1)
   * \. : Literal dot
   * ([\d[a-z]+) : Section/Chapter/Daf (Group 2)
   * \.? : Optional dot
   * (\d+)? : Optional Segment/Verse (Group 3)
   */
  addInputRules() {
    return [
      new InputRule({
        find: /\+([A-Za-z_]+)\.([\d[a-z]+)\.?(\d+)?$/,
        handler: ({ range, match, chain }) => {
          const [fullMatch] = match;

          if (fullMatch) {
            const ref = fullMatch.substring(1); // Remove the '+'

            chain()
              .insertContentAt(range, [
                {
                  type: "text",
                  text: fullMatch,
                  marks: [
                    {
                      type: this.name,
                      attrs: { ref },
                    },
                  ],
                },
              ])
              .run();
          }
        },
      }),
    ];
  },
});
