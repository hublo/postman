import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<string> {
  try {
    const postmanApiKey: string = core.getInput('postman-api-key')
    const workspaceId: string = core.getInput('workspace-id')
    //const collectionName: string = core.getInput('collection-name')
    const input: string = core.getInput('openapi-json')

    const data = {
      workspace: '6ca7e119-fce5-456e-86cd-f6c623c19ff4',
      type: 'json',
      input: `{
        "openapi": "3.0.0",
        "info": {
            "version": "1.0.0",
            "title": "Test API"
        },
        "servers": [
            {
                "url": "http://locahost:3000"
            }
        ],
        "paths": {
            "/user": {
                "get": {
                    "summary": "List all users",
                    "operationId": "listUser",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "query",
                            "required": true,
                            "description": "The user's ID.",
                            "example": 1234,
                            "schema": {
                                "type": "integer",
                                "format": "int32"
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Information about the user.",
                            "headers": {
                                "x-next": {
                                    "description": "A link to the next page of responses.",
                                    "schema": {
                                        "type": "string"
                                    }
                                }
                            },
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "components": {
            "schemas": {
                "User": {
                    "type": "object",
                    "required": [
                        "id",
                        "name"
                    ],
                    "properties": {
                        "id": {
                            "type": "integer",
                            "format": "int64"
                        },
                        "name": {
                            "type": "string"
                        },
                        "tag": {
                            "type": "string"
                        }
                    }
                },
                "Error": {
                    "type": "object",
                    "required": [
                        "code",
                        "message"
                    ],
                    "properties": {
                        "code": {
                            "type": "integer",
                            "format": "int32"
                        },
                        "message": {
                            "type": "string"
                        }
                    }
                }
            }
        }
    }`
    }

    await axios.post('https://api.getpostman.com/import/openapi', data, {
      headers: {
        'x-api-key': postmanApiKey
      }
    })

    return 'ok'
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    return 'not ok'
  }
}

run()
