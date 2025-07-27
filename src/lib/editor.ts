"use client";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";

export const EDITOR_TOOLS: Record<string, any> = {
  header: {
    class: Header,
    inlineToolbar: true,
    config: {},
  },
  list: List,
  quote: Quote,
  inlineCode: InlineCode,
  marker: Marker,
};
