## Landing Page V2 design system

The shared visual source of truth for the Landing Page V2 SERP report is the local paint and text styles in:

https://www.figma.com/design/0OxjqIU1PEaKrF3lYlj77w/Landing-Page-V2?node-id=62-16&p=f

When making design changes under `src/components/serp-report`, use the centralized SERP CSS custom properties for any value represented by a shared design token. Do not hardcode duplicate shared colors or typography values inside individual components or CSS Modules.

Before changing a shared design value, read the current Figma local paint and text styles through the Figma MCP and update the centralized token declaration. Let consuming components inherit the change.

Component-specific layout values may remain local when they do not represent a shared Figma style. Do not fetch Figma data at application runtime.
