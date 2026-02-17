# AGENT.md — Climate FieldView CLI for AI Agents

This document explains how to use the Climate FieldView CLI as an AI agent.

## Overview

The `climatecom` CLI provides access to the Climate FieldView agricultural platform API. Use it to manage fields, farms, boundaries, and view agricultural activity data.

## Prerequisites

Configure with an API key:

```bash
climatecom config set --api-key <key>
climatecom config show
```

## All Commands

### Config

```bash
climatecom config set --api-key <key>
climatecom config show
```

### Fields

```bash
climatecom fields list
climatecom fields list --limit 100
climatecom fields get <field-id>
climatecom fields create --name "North Field" --acres 120.5
```

### Farms

```bash
climatecom farms list
climatecom farms get <farm-id>
```

### Boundaries

```bash
climatecom boundaries list
climatecom boundaries get <boundary-id>
```

### Harvest Activities

```bash
climatecom harvest list
climatecom harvest list --limit 100
climatecom harvest get <activity-id>
```

### Planting Activities

```bash
climatecom planting list
climatecom planting list --limit 100
climatecom planting get <activity-id>
```

## JSON Output

Always use `--json` when parsing results:

```bash
climatecom fields list --json
climatecom farms list --json
climatecom boundaries get <id> --json
climatecom harvest list --json
climatecom planting list --json
```

## Key Fields

- `acres` — Field or activity area in acres
- `crop` — Crop type (e.g., CORN, SOYBEANS, WHEAT)
- `startTime` / `endTime` — ISO 8601 timestamps
- `boundary` — GeoJSON polygon for field boundary

## Error Handling

The CLI exits with code 1 on error. Common errors:
- `Authentication failed` — Check API key
- `Resource not found` — Verify ID is correct
- `Rate limit exceeded` — Wait and retry
