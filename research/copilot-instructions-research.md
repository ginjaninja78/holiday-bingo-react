# GitHub Copilot Instructions Research

## Source
https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot

## Key Findings

### Three Types of Custom Instructions

1. **Repository-wide custom instructions** (`.github/copilot-instructions.md`)
   - Apply to all requests made in the context of a repository
   - Should be no longer than 2 pages
   - Must not be task-specific

2. **Path-specific custom instructions** (`.github/instructions/NAME.instructions.md`)
   - Apply to requests made in the context of files that match a specified path
   - Can be combined with repository-wide instructions

3. **Agent instructions** (`AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`)
   - Used by AI agents
   - Nearest `AGENTS.md` in directory tree takes precedence
   - Alternative: single `CLAUDE.md` or `GEMINI.md` in repository root

### What to Include in copilot-instructions.md

#### High-Level Details
- Summary of what the repository does
- Repository size, type, languages, frameworks, target runtimes

#### Build Instructions
- Bootstrap, build, test, run, lint commands
- Versions of runtime/build tools
- Validated command sequences
- Preconditions and postconditions
- Environment setup steps (even "optional" ones that are actually required)
- Timing requirements for long-running commands
- Always use language like "always run npm install before building"

#### Project Layout
- Major architectural elements
- Relative paths to main project files
- Location of configuration files (linting, compilation, testing)
- GitHub workflows, CI builds, validation pipelines
- Validation steps agents can use
- Non-obvious dependencies
- File structure (root files, README contents, key source files)

### Goals
- Reduce likelihood of PR rejection due to CI failures
- Minimize bash command and build failures
- Allow agent to complete tasks quickly by minimizing exploration

### Best Practices
- Validate all commands by running them
- Document errors and workarounds
- Test in clean environments
- Document unexpected build issues
- Record validation steps from documentation
- Search for 'HACK', 'TODO', etc. in codebase

## GitHub's Recommended Prompt for Generation

GitHub provides a comprehensive prompt for asking Copilot coding agent to generate copilot-instructions.md. Key sections:
- Comprehensive codebase inventory
- Build step validation
- Architecture documentation
- Layout and structure details
