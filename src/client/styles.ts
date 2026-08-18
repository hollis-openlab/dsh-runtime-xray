/** Theme-token-only styles owned by the browser bundle. */

export const STYLES = `
[data-dsh-runtime-xray] {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-1);
}
[data-dsh-runtime-xray] .xray-toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 8px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
}
[data-dsh-runtime-xray] button,
[data-dsh-runtime-xray] input,
[data-dsh-runtime-xray] select {
  font: var(--dsw-font-xxs-12);
}
[data-dsh-runtime-xray] button {
  min-height: 22px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
  cursor: pointer;
}
[data-dsh-runtime-xray] button:hover,
[data-dsh-runtime-xray] button:focus-visible {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
[data-dsh-runtime-xray] button:focus-visible,
[data-dsh-runtime-xray] input:focus-visible {
  outline: 1px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}
[data-dsh-runtime-xray] .xray-scope {
  color: var(--dsw-alias-state-business-primary);
  font-weight: 500;
}
[data-dsh-runtime-xray] .xray-segment,
[data-dsh-runtime-xray] .xray-domain-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
}
[data-dsh-runtime-xray] .xray-export-preview {
  position: absolute;
  z-index: 3;
  top: 40px;
  right: 16px;
  width: min(360px, calc(100% - 32px));
  padding: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-shadow-md, 0 8px 24px rgb(0 0 0 / 16%));
}
[data-dsh-runtime-xray] .xray-export-preview p { color: var(--dsw-alias-label-tertiary); }
[data-dsh-runtime-xray] .xray-segment button[aria-pressed='true'],
[data-dsh-runtime-xray] .xray-domain-tabs button[aria-selected='true'] {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-selected);
}
[data-dsh-runtime-xray] .xray-domain-tabs {
  flex: none;
  min-height: 34px;
  padding: 0 20px;
  overflow-x: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}
[data-dsh-runtime-xray] .xray-search {
  width: min(220px, 35vw);
  margin-left: auto;
  padding: 4px 7px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 4px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
}
[data-dsh-runtime-xray] select {
  max-width: 120px;
  padding: 4px 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 4px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
}
[data-dsh-runtime-xray] .xray-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 20px 24px;
}
[data-dsh-runtime-xray] .xray-content {
  width: min(900px, 100%);
  margin: 0 auto;
}
[data-dsh-runtime-xray] .xray-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
[data-dsh-runtime-xray] .xray-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
[data-dsh-runtime-xray] .xray-heading span,
[data-dsh-runtime-xray] .xray-meta {
  color: var(--dsw-alias-label-caption);
}
[data-dsh-runtime-xray] .xray-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
[data-dsh-runtime-xray] .xray-card {
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
}
[data-dsh-runtime-xray] .xray-card strong {
  display: block;
  margin-bottom: 3px;
  font-size: 16px;
  font-weight: 600;
}
[data-dsh-runtime-xray] .xray-card span {
  color: var(--dsw-alias-label-tertiary);
}
[data-dsh-runtime-xray] .xray-list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
[data-dsh-runtime-xray] .xray-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 5px;
}
[data-dsh-runtime-xray] .xray-entry:hover,
[data-dsh-runtime-xray] .xray-entry:focus-visible {
  border-color: var(--dsw-alias-border-l2);
}
[data-dsh-runtime-xray] .xray-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: var(--dsw-alias-label-caption);
}
[data-dsh-runtime-xray] .xray-dot[data-active='true'] {
  background: var(--dsw-alias-state-success);
}
[data-dsh-runtime-xray] .xray-entry-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
[data-dsh-runtime-xray] .xray-entry-module {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--dsw-alias-label-caption);
  text-overflow: ellipsis;
  white-space: nowrap;
}
[data-dsh-runtime-xray] .xray-entry-status {
  flex: none;
  color: var(--dsw-alias-label-caption);
}
[data-dsh-runtime-xray] .xray-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
[data-dsh-runtime-xray] .xray-domain-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
}
[data-dsh-runtime-xray] .xray-domain-card span,
[data-dsh-runtime-xray] .xray-diagnostics,
[data-dsh-runtime-xray] .xray-details p {
  color: var(--dsw-alias-label-tertiary);
}
[data-dsh-runtime-xray] .xray-diagnostics {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  font-size: 11px;
}
[data-dsh-runtime-xray] .xray-details {
  width: min(360px, 35%);
  flex: none;
  margin-left: 16px;
  padding: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  overflow: auto;
}
[data-dsh-runtime-xray] .xray-details h3 { margin: 0; font-size: 13px; }
[data-dsh-runtime-xray] .xray-details pre {
  max-height: 420px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font: var(--dsw-font-xxs-12);
}
[data-dsh-runtime-xray] .xray-status {
  padding: 12px;
  color: var(--dsw-alias-label-tertiary);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
}
@media (max-width: 640px) {
  [data-dsh-runtime-xray] .xray-body { padding: 12px; }
  [data-dsh-runtime-xray] .xray-summary,
  [data-dsh-runtime-xray] .xray-overview { grid-template-columns: 1fr; }
  [data-dsh-runtime-xray] .xray-entry-module { display: none; }
  [data-dsh-runtime-xray] .xray-details { width: auto; margin: 12px 0 0; }
  [data-dsh-runtime-xray] .xray-body { flex-direction: column; }
}
`
