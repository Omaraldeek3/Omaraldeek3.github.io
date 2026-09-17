# Native vector import — delivered implementation

User request: accept CorelDRAW CDR and DXF files in the existing toolkit.

- [x] Browser ASCII DXF reader: units, lines, polylines/bulges, circles, arcs, ellipses and rational control-point splines; reject unsupported entities and preserve every supported contour.
- [x] Group enclosed DXF contours with outermost pieces to keep holes attached during nesting. Avoid grouping touching, intersecting or open contours.
- [x] Private, checksum-verified libcdr runtime from official MSYS2 packages; reproducible package lock and setup script. No CorelDRAW automation dependency.
- [x] Same-origin loopback CDR conversion route: binary/type/size validation, one conversion at a time, bounded subprocess without shell, temporary-file cleanup, useful errors.
- [x] SVG/DXF/CDR file picker in nesting, cleanup and repeat tools; explicit unit choice, optional deliberate width override, CDR page selection, cancellation and stale-output protection.
- [x] Update English/Arabic copy and privacy statements to accurately describe local helper conversion.
- [x] Format-specific tests plus the full portfolio/toolkit regression suite, TypeScript, lint and production build.

Runtime decision: native CorelDRAW automation was investigated but not used. The independent libcdr reader successfully converted an installed CorelDRAW vector sample with its original physical page dimensions. No cloud conversion service is involved. Native CDR text, raster content and unsupported effects must be flattened to supported curves before import.

The updated guide is docs/TOOLKIT.md. The runtime remains private under .tools/cdr and is not served as a web asset.
