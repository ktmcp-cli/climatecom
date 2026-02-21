> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Climate FieldView CLI

A production-ready command-line interface for the [Climate FieldView](https://climate.com) agricultural platform API. Manage fields, farms, boundaries, and view harvest and planting activities directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by The Climate Corporation.

## Features

- **Fields** — List, get, and create farm fields
- **Farms** — Browse and inspect farms
- **Boundaries** — View field boundary geometries
- **Harvest** — Track harvest activities and yields
- **Planting** — View planting activities and crop data
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output with chalk

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/climatecom
```

## Authentication Setup

Get your API key from the [Climate FieldView Developer Portal](https://dev.climate.com).

### Configure the CLI

```bash
climatecom config set --api-key YOUR_API_KEY
```

## Commands

### Configuration

```bash
climatecom config set --api-key <key>
climatecom config show
```

### Fields

```bash
# List all fields
climatecom fields list

# Get a specific field
climatecom fields get <field-id>

# Create a field
climatecom fields create --name "North Field" --acres 120.5
```

### Farms

```bash
# List all farms
climatecom farms list

# Get a specific farm
climatecom farms get <farm-id>
```

### Boundaries

```bash
# List all field boundaries
climatecom boundaries list

# Get a specific boundary (includes GeoJSON geometry)
climatecom boundaries get <boundary-id>
```

### Harvest Activities

```bash
# List harvest activities
climatecom harvest list

# Get a specific harvest activity
climatecom harvest get <activity-id>
```

### Planting Activities

```bash
# List planting activities
climatecom planting list

# Get a specific planting activity
climatecom planting get <activity-id>
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all fields as JSON
climatecom fields list --json

# Get boundary geometry
climatecom boundaries get <id> --json | jq '.geometry'

# List harvest activities with yield data
climatecom harvest list --json | jq '.[] | {field: .fieldName, crop: .crop, area: .area}'
```

## Examples

### Farm overview

```bash
# List all farms
climatecom farms list --json | jq '.[].name'

# Get all fields for analysis
climatecom fields list --json | jq '[.[] | {name, acres}] | sort_by(.acres) | reverse'
```

### Season planning

```bash
# View previous planting activities
climatecom planting list --json

# View harvest results
climatecom harvest list --json | jq '[.[] | select(.crop == "CORN")]'
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/climatecom](https://github.com/ktmcp-cli/climatecom).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.


---

## Support KTMCP

If you find this CLI useful, we'd greatly appreciate your support! Share your experience on:
- Reddit
- Twitter/X
- Hacker News

**Incentive:** Users who can demonstrate that their support/advocacy helped advance KTMCP will have their feature requests and issues prioritized.

Just be mindful - these are real accounts and real communities. Authentic mentions and genuine recommendations go a long way!

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.
