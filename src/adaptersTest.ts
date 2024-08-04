export type FieldProps<Extras extends Record<string, unknown> = {}> = {
  required?: boolean;
  min?: number;
  max?: number;
  // etc...
} & Extras

export type DescribeSchema<S = any, V = any, D = any> = (
  schema: S,
  values: V,
) => D

export type GetFieldDescriptionByPath<D = any, FD = any> = (path: string, schemaDescription: D) => FD;

export type ExtractPropsFromFieldDescription<FD = any, Extras extends Record<string, unknown> = {}> = (fieldDescription: FD) => FieldProps<Extras>;

export type GetSchemaPropsByPath<D = any, Extras extends Record<string, unknown> = {}> = (path: string, schemaDescription: D) => FieldProps<Extras>;

export type GetSchemaPropsAdapterConfig<S = any, D = any, FD = any, V = any, Extras extends Record<string, unknown> = {}> = {
  describeSchema: DescribeSchema<S, V, D>,
  getFieldDescriptionByPath: GetFieldDescriptionByPath<D, FD>,
  extractPropsFromFieldDescription: ExtractPropsFromFieldDescription<FD, Extras>,
}

export const createSchemaAdapter = <S = any, D = any, FD = any, V = any, Extras extends Record<string, unknown> = {}>(config: GetSchemaPropsAdapterConfig<S, D, FD, V, Extras>) => {
  return {
    describeSchema: config.describeSchema,
    getSchemaPropsByPath: (path: string, schemaDescription: D): ReturnType<GetSchemaPropsByPath<D, Extras>> => {
      const fieldDescription = config.getFieldDescriptionByPath(path, schemaDescription);
      return config.extractPropsFromFieldDescription(fieldDescription);
    }
  }
}
