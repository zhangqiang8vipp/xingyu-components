/** A small serializable schema subset; no eval, HTML, event handlers, URLs, or executable content. */
export type ValueSchema =
  | { readonly type: "string"; readonly minLength?: number; readonly maxLength: number; readonly enum?: readonly string[] }
  | { readonly type: "number" | "integer"; readonly minimum: number; readonly maximum: number }
  | { readonly type: "boolean" }
  | { readonly type: "object"; readonly required: readonly string[]; readonly properties: Readonly<Record<string, ValueSchema>>; readonly additionalProperties: false };

export type ObjectSchema = Extract<ValueSchema, { type: "object" }>;

export type ComponentCategory = "content" | "layout" | "data" | "interaction";

export interface ComponentDefinition {
  readonly type: string;
  readonly version: 1;
  readonly label: string;
  readonly description: string;
  readonly category: ComponentCategory;
  readonly propsSchema: ObjectSchema;
  readonly children: "none" | "required";
}

export interface DocumentBlock {
  readonly type: string;
  readonly version: 1;
  readonly props: Readonly<Record<string, unknown>>;
  readonly children?: readonly DocumentBlock[];
}

export interface XingyuDocument {
  readonly version: 1;
  readonly blocks: readonly DocumentBlock[];
}

export interface ComponentRegistry {
  /** Only trusted application code may call register(). Never register from article data. */
  register(definition: ComponentDefinition): void;
  get(type: string): ComponentDefinition | undefined;
  list(): readonly ComponentDefinition[];
}

export interface CapabilityManifest {
  readonly protocol: "xingyu-document";
  readonly version: 1;
  readonly contentModel: "render-only";
  readonly constraints: {
    readonly maxSourceCharacters: number;
    readonly maxBlocks: number;
    readonly maxDepth: number;
  };
  readonly components: readonly {
    readonly type: string;
    readonly version: 1;
    readonly label: string;
    readonly description: string;
    readonly category: ComponentCategory;
    readonly propsSchema: ObjectSchema;
    readonly children: "none" | "required";
  }[];
  readonly authoringGuidance: readonly string[];
}

export type ParseResult =
  | { readonly ok: true; readonly document: XingyuDocument }
  | { readonly ok: false; readonly source: string; readonly reason: "invalid-json" | "unsupported-document" | "too-large" };
