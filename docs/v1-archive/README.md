# V1 Documentation Archive

These documents are from the original V1 architecture and are kept for historical reference only.

**The V1 database tables (`routes`, `stops`, `pickup_events`, `message_state`) are no longer used.**

The current V2 architecture uses:
- `route_templates` + `template_stops` (admin-managed route definitions)
- `route_instances` + `instance_stops` (sent to drivers)
- `v2_pickup_events` (driver pickup logs)

For current documentation, see the root `README.md` and `CLAUDE.md`.
