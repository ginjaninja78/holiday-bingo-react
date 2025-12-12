# GitHub MCP Server Configuration Research

## Source
https://raw.githubusercontent.com/github/github-mcp-server/main/docs/server-configuration.md

## Key Findings

### Configuration Options

| Configuration | Remote Server | Local Server |
|---------------|---------------|--------------|
| Toolsets | `X-MCP-Toolsets` header or `/x/{toolset}` URL | `--toolsets` flag or `GITHUB_TOOLSETS` env var |
| Individual Tools | `X-MCP-Tools` header | `--tools` flag or `GITHUB_TOOLS` env var |
| Read-Only Mode | `X-MCP-Readonly` header or `/readonly` URL | `--read-only` flag or `GITHUB_READ_ONLY` env var |
| Dynamic Mode | Not available | `--dynamic-toolsets` flag or `GITHUB_DYNAMIC_TOOLSETS` env var |
| Lockdown Mode | `X-MCP-Lockdown` header | `--lockdown-mode` flag or `GITHUB_LOCKDOWN_MODE` env var |

### Default Behavior
If no configuration specified, server uses default toolsets: `context`, `issues`, `pull_requests`, `repos`, `users`

### Configuration Strategies

#### 1. Enabling Specific Tools (Token Optimization)
**Best for:** Users who know exactly what they need and want to optimize context usage

**Benefits:**
- Minimizes token usage by loading only required tools
- Reduces context window consumption
- Faster initialization

**Example:**
```json
{
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "X-MCP-Tools": "get_file_contents,get_me,pull_request_read"
  }
}
```

#### 2. Enabling Specific Toolsets
**Best for:** Users who want multiple related tools

**Example toolsets:**
- `context` - Repository context and file operations
- `issues` - Issue management
- `pull_requests` - PR operations
- `repos` - Repository management
- `users` - User information
- `gists` - Gist operations
- `search` - Code/issue/PR search

#### 3. Hybrid: Toolsets + Individual Tools
**Best for:** Broad functionality from some areas, specific tools from others

**Example:**
```json
{
  "headers": {
    "X-MCP-Toolsets": "repos,issues",
    "X-MCP-Tools": "get_gist,pull_request_read"
  }
}
```

#### 4. Dynamic Discovery (Local Only)
**Best for:** Letting LLM discover and enable toolsets as needed

**Key advantage:** Starts minimal, expands on demand
**Tools provided:** `enable_toolset`, `list_available_toolsets`, `get_toolset_tools`

**Example:**
```json
{
  "args": [
    "stdio",
    "--dynamic-toolsets",
    "--tools=get_me,search_code"
  ]
}
```

### Security Modes

#### Read-Only Mode
- Disables ALL write tools even if explicitly requested
- Takes precedence over all other configuration
- Best for security-conscious users

#### Lockdown Mode
- Limits content from users without push access in public repos
- Private repositories unaffected
- Collaborators retain full access to their own content

### Token Usage Optimization Strategies

1. **Prefer Specific Tools Over Toolsets**
   - Load only what you need
   - Reduces available tool count in context

2. **Use Dynamic Mode for Exploratory Work**
   - Start with minimal tools
   - LLM requests additional tools only when needed

3. **Return Tool Results, Not Code**
   - MCP tools should return RESULT data
   - Avoid generating code in responses when tool can handle it
   - Example: Use `get_file_contents` tool result instead of describing file structure

4. **Combine Read-Only Mode for Safety**
   - Prevents accidental writes
   - Reduces tool count by excluding write operations

### Composability
All configuration options are **composable** - can combine:
- Toolsets + individual tools
- Dynamic discovery + pre-enabled tools
- Read-only mode + any other configuration
- Lockdown mode + any other configuration

### Best Practices for Multi-Agent Setup

1. **Manus (this agent):** Full access to all toolsets for comprehensive project work
2. **GitHub Copilot:** Focused toolsets based on current task context
3. **Specialized Agents:** Minimal tool sets for specific purposes

### Master MCP Server Configuration Recommendation

For a universal GitHub MCP server that works across all dev projects:

```json
{
  "type": "stdio",
  "command": "go",
  "args": [
    "run",
    "./cmd/github-mcp-server",
    "stdio",
    "--dynamic-toolsets",
    "--toolsets=context,repos,issues,pull_requests",
    "--tools=search_code,get_me"
  ],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}"
  }
}
```

**Rationale:**
- Dynamic mode allows expansion as needed
- Pre-loaded common toolsets for immediate use
- Search tools always available
- User context readily accessible
- Balances token efficiency with functionality
