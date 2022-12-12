export {getValues, Value, JsonfileContent}

interface Value {
  key: string
  value: string
  enabled: string
  type: string
}

interface ValueArg {
  secretKeyGithub?: string
  key: string
  enabled: string
  type: string
  value: string
}

interface JsonfileContent {
  values: ValueArg[]
}

function getValues(
  jsonfileContent: JsonfileContent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postmanEnvSecrets: any
): Value[] {
  const values = jsonfileContent.values
  return values.map((value: ValueArg) => {
    if (value.secretKeyGithub) {
      return {
        key: value.key,
        value: postmanEnvSecrets[value.secretKeyGithub],
        enabled: value.enabled,
        type: value.type
      }
    } else {
      return {
        key: value.key,
        value: value.value,
        enabled: value.enabled,
        type: value.type
      }
    }
  })
}
