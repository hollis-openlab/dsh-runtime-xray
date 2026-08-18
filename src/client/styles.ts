/** Theme-token-only styles owned by the browser bundle. */

export const STYLES = `
[data-dsh-runtime-xray] {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background:
    radial-gradient(circle at 82% -10%, color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent), transparent 34%),
    var(--dsw-alias-bg-layer-1);
}

[data-dsh-runtime-xray] button,
[data-dsh-runtime-xray] input,
[data-dsh-runtime-xray] select {
  font: var(--dsw-font-xxs-12);
}

[data-dsh-runtime-xray] button {
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  cursor: pointer;
  transition:
    color 120ms var(--ds-ease-in-out),
    background 120ms var(--ds-ease-in-out),
    border-color 120ms var(--ds-ease-in-out),
    box-shadow 120ms var(--ds-ease-in-out);
}

[data-dsh-runtime-xray] button:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

[data-dsh-runtime-xray] button:focus-visible,
[data-dsh-runtime-xray] input:focus-visible,
[data-dsh-runtime-xray] select:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}

[data-dsh-runtime-xray] button:disabled {
  cursor: default;
  opacity: 0.45;
}

[data-dsh-runtime-xray] .xray-topbar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 54px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, transparent);
}

[data-dsh-runtime-xray] .xray-scope-block {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

[data-dsh-runtime-xray] .xray-scope-label {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxs-strong-12);
}

[data-dsh-runtime-xray] .xray-scope-hint {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-caption);
  font: var(--dsw-font-xxxs-11);
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-segment {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-segment button {
  min-height: 26px;
  border-radius: 6px;
}

[data-dsh-runtime-xray] .xray-segment button[aria-pressed='true'] {
  color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-state-business-tertiary);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent);
  font-weight: 600;
}

[data-dsh-runtime-xray] .xray-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

[data-dsh-runtime-xray] .xray-action {
  border-color: var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-action-primary {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 34%, transparent);
  color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-state-business-tertiary);
}

[data-dsh-runtime-xray] .xray-filterbar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 5px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}

[data-dsh-runtime-xray] .xray-search {
  width: min(280px, 40vw);
  margin-left: auto;
  padding: 6px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-search::placeholder {
  color: var(--dsw-alias-label-caption);
}

[data-dsh-runtime-xray] select {
  max-width: 150px;
  padding: 6px 9px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-domain-tabs {
  display: flex;
  flex: none;
  min-height: 50px;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  overflow-x: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
}

[data-dsh-runtime-xray] .xray-domain-tabs button {
  position: relative;
  min-height: 37px;
  padding: 0 12px;
  border-radius: 0;
}

[data-dsh-runtime-xray] .xray-domain-overview {
  flex: none;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px !important;
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-domain-layer {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 82%, transparent);
}

[data-dsh-runtime-xray] .xray-domain-layer-label {
  padding: 0 6px;
  color: var(--dsw-alias-label-caption);
  font: var(--dsw-font-xxxs-11);
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-domain-layer-tabs {
  display: inline-flex;
  gap: 2px;
}

[data-dsh-runtime-xray] .xray-domain-layer-tabs button {
  min-height: 30px;
  padding: 0 9px;
  border-radius: 6px;
}

[data-dsh-runtime-xray] .xray-domain-layer-tabs button[aria-selected='true'] {
  color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-state-business-tertiary);
  font-weight: 600;
}

[data-dsh-runtime-xray] .xray-domain-layer-tabs button[aria-selected='true']::after {
  display: none;
}

[data-dsh-runtime-xray] .xray-domain-tabs button[aria-selected='true'] {
  color: var(--dsw-alias-state-business-primary);
  font-weight: 600;
}

[data-dsh-runtime-xray] .xray-domain-tabs button[aria-selected='true']::after {
  position: absolute;
  right: 8px;
  bottom: -1px;
  left: 8px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--dsw-alias-state-business-primary);
  content: '';
}

[data-dsh-runtime-xray] .xray-export-preview {
  position: absolute;
  z-index: 6;
  top: 62px;
  right: 16px;
  width: min(380px, calc(100% - 32px));
  padding: 16px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-shadow-lv3);
}

[data-dsh-runtime-xray] .xray-export-preview strong {
  font: var(--dsw-font-s-strong-14);
}

[data-dsh-runtime-xray] .xray-export-preview p {
  color: var(--dsw-alias-label-tertiary);
  line-height: 1.6;
}

[data-dsh-runtime-xray] .xray-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 22px 24px 32px;
}

[data-dsh-runtime-xray] .xray-content {
  width: min(1180px, 100%);
  margin: 0 auto;
}

[data-dsh-runtime-xray] .xray-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

[data-dsh-runtime-xray] .xray-heading-copy h2 {
  margin: 0;
  font: var(--dsw-font-l-20);
  font-weight: 650;
}

[data-dsh-runtime-xray] .xray-heading-copy p {
  max-width: 720px;
  margin: 6px 0 0;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxs-12);
  line-height: 1.6;
}

[data-dsh-runtime-xray] .xray-meta {
  max-width: 45%;
  overflow: hidden;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  color: var(--dsw-alias-label-caption);
  background: var(--dsw-alias-bg-layer-2);
  font: var(--dsw-font-xxxs-11);
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-domain-intro {
  margin: -6px 0 14px;
  padding: 9px 11px;
  border-left: 3px solid var(--dsw-alias-state-business-primary);
  border-radius: 0 7px 7px 0;
  color: var(--dsw-alias-label-tertiary);
  background: var(--dsw-alias-state-business-tertiary);
  font: var(--dsw-font-xxs-12);
}

[data-dsh-runtime-xray] .xray-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

[data-dsh-runtime-xray] .xray-card {
  position: relative;
  min-height: 72px;
  box-sizing: border-box;
  padding: 12px 14px 11px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-shadow-lv1);
}

[data-dsh-runtime-xray] .xray-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--dsw-alias-label-caption);
  content: '';
}

[data-dsh-runtime-xray] .xray-card[data-tone='brand']::before,
[data-dsh-runtime-xray] .xray-card[data-tone='partial']::before {
  background: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-card[data-tone='success']::before,
[data-dsh-runtime-xray] .xray-card[data-tone='healthy']::before {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-card[data-tone='failed']::before {
  background: var(--dsw-alias-state-error-primary);
}

[data-dsh-runtime-xray] .xray-card span {
  display: block;
  margin-bottom: 5px;
  color: var(--dsw-alias-label-tertiary);
}

[data-dsh-runtime-xray] .xray-card strong {
  display: block;
  overflow: hidden;
  font: var(--dsw-font-m-18);
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-list {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

[data-dsh-runtime-xray] .xray-entry {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  min-height: 42px;
  padding: 7px 11px;
  border-color: var(--dsw-alias-border-l1);
  border-radius: 8px;
  text-align: left;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent);
}

[data-dsh-runtime-xray] .xray-entry:hover,
[data-dsh-runtime-xray] .xray-entry:focus-visible {
  z-index: 5;
}

[data-dsh-runtime-xray] .xray-entry-tooltip {
  position: absolute;
  z-index: 10;
  top: calc(100% + 6px);
  left: 42px;
  max-width: min(460px, calc(100vw - 96px));
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-shadow-lv3);
  font: var(--dsw-font-xxs-12);
  line-height: 1.5;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-3px);
  transition: opacity 120ms var(--ds-ease-in-out), transform 120ms var(--ds-ease-in-out), visibility 120ms var(--ds-ease-in-out);
  visibility: hidden;
  white-space: normal;
}

[data-dsh-runtime-xray] .xray-entry:hover .xray-entry-tooltip,
[data-dsh-runtime-xray] .xray-entry:focus-visible .xray-entry-tooltip {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

[data-dsh-runtime-xray] .xray-entry:hover,
[data-dsh-runtime-xray] .xray-entry:focus-visible,
[data-dsh-runtime-xray] .xray-entry[aria-pressed='true'] {
  border-color: var(--dsw-alias-border-l3);
  background: var(--dsw-alias-interactive-bg-hover);
}

[data-dsh-runtime-xray] .xray-entry[aria-pressed='true'] {
  box-shadow: inset 3px 0 0 var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-entry[data-tree='true'] {
  padding-left: calc(11px + var(--xray-tree-depth) * 14px);
}

[data-dsh-runtime-xray] .xray-tree-branch {
  width: 12px;
  flex: none;
  color: var(--dsw-alias-label-caption);
  font-family: var(--ds-font-family-code);
}

[data-dsh-runtime-xray] .xray-dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--dsw-alias-label-caption);
}

[data-dsh-runtime-xray] .xray-dot[data-status='active'],
[data-dsh-runtime-xray] .xray-dot[data-status='available'],
[data-dsh-runtime-xray] .xray-dot[data-status='ready'] {
  background: var(--dsw-alias-state-success-primary);
  box-shadow: 0 0 0 3px var(--dsw-alias-state-success-tertiary);
}

[data-dsh-runtime-xray] .xray-dot[data-status='failed'],
[data-dsh-runtime-xray] .xray-dot[data-status='missing'] {
  background: var(--dsw-alias-state-error-primary);
}

[data-dsh-runtime-xray] .xray-dot[data-status='partial'],
[data-dsh-runtime-xray] .xray-dot[data-status='pending'],
[data-dsh-runtime-xray] .xray-dot[data-status='loading'] {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-entry-name {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 2px 7px;
  border-radius: 999px;
  color: var(--dsw-alias-label-tertiary);
  background: var(--dsw-alias-bg-module-platform);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-entry-status[data-status='active'],
[data-dsh-runtime-xray] .xray-entry-status[data-status='available'],
[data-dsh-runtime-xray] .xray-entry-status[data-status='ready'] {
  color: var(--dsw-alias-state-success-primary);
  background: var(--dsw-alias-state-success-tertiary);
}

[data-dsh-runtime-xray] .xray-entry-status[data-status='failed'] {
  color: var(--dsw-alias-state-error-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, var(--dsw-alias-bg-layer-2));
}

[data-dsh-runtime-xray] .xray-prompt-composition {
  display: grid;
  gap: 12px;
}

[data-dsh-runtime-xray] .xray-context-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

[data-dsh-runtime-xray] .xray-context-stats article {
  position: relative;
  display: grid;
  min-height: 88px;
  box-sizing: border-box;
  align-content: center;
  padding: 13px 15px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 11px;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-shadow-lv1);
}

[data-dsh-runtime-xray] .xray-context-stats article::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: var(--dsw-alias-state-business-primary);
  content: '';
}

[data-dsh-runtime-xray] .xray-context-stats article[data-kind='context']::before {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-context-stats article[data-kind='variable']::before {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-context-stats span,
[data-dsh-runtime-xray] .xray-context-stats small {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-context-stats strong {
  margin-top: 3px;
  font: var(--dsw-font-m-18);
  font-weight: 680;
}

[data-dsh-runtime-xray] .xray-context-stats small {
  margin-top: 2px;
}

[data-dsh-runtime-xray] .xray-context-meter {
  display: flex;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--dsw-alias-bg-module-platform);
}

[data-dsh-runtime-xray] .xray-context-meter span[data-kind='section'] {
  background: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-context-meter span[data-kind='context'] {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-context-groups {
  display: grid;
  gap: 7px;
}

[data-dsh-runtime-xray] .xray-context-group {
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 78%, transparent);
}

[data-dsh-runtime-xray] .xray-context-group summary {
  display: grid;
  min-height: 46px;
  box-sizing: border-box;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  cursor: pointer;
  list-style: none;
}

[data-dsh-runtime-xray] .xray-context-group summary::-webkit-details-marker {
  display: none;
}

[data-dsh-runtime-xray] .xray-context-group summary:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

[data-dsh-runtime-xray] .xray-context-group-mark {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-context-group[data-kind='context'] .xray-context-group-mark {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-context-group[data-kind='variable'] .xray-context-group-mark {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-context-group summary strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--dsw-font-xxs-strong-12);
}

[data-dsh-runtime-xray] .xray-context-group summary > span:not(.xray-context-group-mark),
[data-dsh-runtime-xray] .xray-context-group summary small {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-context-group ul {
  display: grid;
  margin: 0;
  padding: 0 8px 8px;
  gap: 4px;
  list-style: none;
}

[data-dsh-runtime-xray] .xray-context-group li button {
  display: grid;
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 6px 9px;
  border-color: var(--dsw-alias-border-l1);
  border-radius: 7px;
  text-align: left;
  background: var(--dsw-alias-bg-layer-1);
}

[data-dsh-runtime-xray] .xray-context-group li button[aria-pressed='true'] {
  border-color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-state-business-tertiary);
}

[data-dsh-runtime-xray] .xray-context-group li button strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 11px/16px var(--ds-font-family-code);
}

[data-dsh-runtime-xray] .xray-context-group li button > span:last-child,
[data-dsh-runtime-xray] .xray-context-position {
  color: var(--dsw-alias-label-caption);
  font: 10px/15px var(--ds-font-family-code);
}

[data-dsh-runtime-xray] .xray-effect-composition {
  display: grid;
  gap: 12px;
}

[data-dsh-runtime-xray] .xray-effect-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

[data-dsh-runtime-xray] .xray-effect-stats article {
  position: relative;
  display: grid;
  min-height: 82px;
  box-sizing: border-box;
  align-content: center;
  padding: 12px 14px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-effect-stats article::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: var(--dsw-alias-state-business-primary);
  content: '';
}

[data-dsh-runtime-xray] .xray-effect-stats span,
[data-dsh-runtime-xray] .xray-effect-stats small {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-effect-stats strong {
  margin-top: 3px;
  font: var(--dsw-font-m-18);
  font-weight: 680;
}

[data-dsh-runtime-xray] .xray-effect-groups {
  display: grid;
  gap: 7px;
}

[data-dsh-runtime-xray] .xray-effect-group {
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 78%, transparent);
}

[data-dsh-runtime-xray] .xray-effect-group summary {
  display: grid;
  min-height: 46px;
  box-sizing: border-box;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  cursor: pointer;
  list-style: none;
}

[data-dsh-runtime-xray] .xray-effect-group summary::-webkit-details-marker {
  display: none;
}

[data-dsh-runtime-xray] .xray-effect-group summary:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

[data-dsh-runtime-xray] .xray-effect-group-mark {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-effect-group[data-kind='plugin'] .xray-effect-group-mark {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-effect-group[data-kind='timer'] .xray-effect-group-mark {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-effect-group summary strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--dsw-font-xxs-strong-12);
}

[data-dsh-runtime-xray] .xray-effect-group summary > span:not(.xray-effect-group-mark),
[data-dsh-runtime-xray] .xray-effect-group summary small {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-effect-group ul {
  display: grid;
  margin: 0;
  padding: 0 8px 8px;
  gap: 4px;
  list-style: none;
}

[data-dsh-runtime-xray] .xray-effect-group li button {
  display: grid;
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  grid-template-columns: 54px minmax(0, 1fr) minmax(0, 42%);
  align-items: center;
  gap: 10px;
  padding: 6px 9px;
  border-color: var(--dsw-alias-border-l1);
  border-radius: 7px;
  text-align: left;
  background: var(--dsw-alias-bg-layer-1);
}

[data-dsh-runtime-xray] .xray-effect-group li button[aria-pressed='true'] {
  border-color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-state-business-tertiary);
}

[data-dsh-runtime-xray] .xray-effect-group li button strong,
[data-dsh-runtime-xray] .xray-effect-group li button small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 11px/16px var(--ds-font-family-code);
}

[data-dsh-runtime-xray] .xray-effect-group li button > span,
[data-dsh-runtime-xray] .xray-effect-group li button small {
  color: var(--dsw-alias-label-caption);
  font: 10px/15px var(--ds-font-family-code);
}

[data-dsh-runtime-xray] .xray-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

[data-dsh-runtime-xray] .xray-domain-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 13px 11px 16px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 84%, transparent);
}

[data-dsh-runtime-xray] .xray-domain-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: var(--dsw-alias-label-caption);
  content: '';
}

[data-dsh-runtime-xray] .xray-domain-card[data-status='ready']::before {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-domain-card[data-status='partial']::before,
[data-dsh-runtime-xray] .xray-domain-card[data-status='truncated']::before {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-domain-card[data-status='failed']::before {
  background: var(--dsw-alias-state-error-primary);
}

[data-dsh-runtime-xray] .xray-domain-card span,
[data-dsh-runtime-xray] .xray-domain-card time,
[data-dsh-runtime-xray] .xray-diagnostics,
[data-dsh-runtime-xray] .xray-details p {
  color: var(--dsw-alias-label-tertiary);
}

[data-dsh-runtime-xray] .xray-visual-section {
  grid-column: 1 / -1;
  min-width: 0;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--dsw-alias-border-l1);
}

[data-dsh-runtime-xray] .xray-visual-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

[data-dsh-runtime-xray] .xray-visual-heading h3 {
  margin: 0;
  font: var(--dsw-font-s-strong-14);
}

[data-dsh-runtime-xray] .xray-visual-heading p {
  margin: 3px 0 0;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxs-12);
}

[data-dsh-runtime-xray] .xray-visual-heading > span {
  flex: none;
  color: var(--dsw-alias-label-caption);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-scope-tree {
  display: flex;
  align-items: stretch;
  gap: 0;
}

[data-dsh-runtime-xray] .xray-scope-tree-step {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
}

[data-dsh-runtime-xray] .xray-scope-connector {
  display: flex;
  width: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-state-business-primary);
  transform: rotate(-90deg);
}

[data-dsh-runtime-xray] .xray-scope-node {
  display: grid;
  min-width: 0;
  flex: 1;
  padding: 12px 13px;
  gap: 3px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .xray-scope-node[data-kind='preset'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, var(--dsw-alias-border-l2));
  background: color-mix(in srgb, var(--dsw-alias-state-business-tertiary) 60%, var(--dsw-alias-bg-layer-2));
}

[data-dsh-runtime-xray] .xray-scope-node[data-kind='session'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, var(--dsw-alias-border-l2));
}

[data-dsh-runtime-xray] .xray-scope-node-kind,
[data-dsh-runtime-xray] .xray-scope-node small {
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-scope-note {
  margin: 8px 0 0;
  color: var(--dsw-alias-label-caption);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-network {
  display: block;
  width: 100%;
  max-height: 420px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 68%, transparent);
}

[data-dsh-runtime-xray] .xray-network-edge {
  fill: none;
  stroke: color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, var(--dsw-alias-border-l2));
  stroke-width: 1.5;
}

[data-dsh-runtime-xray] .xray-network-edge[data-quality='inferred'] {
  stroke: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 58%, var(--dsw-alias-border-l2));
  stroke-dasharray: 5 4;
}

[data-dsh-runtime-xray] .xray-network-node rect {
  fill: var(--dsw-alias-bg-layer-2);
  stroke: var(--dsw-alias-border-l2);
}

[data-dsh-runtime-xray] .xray-network-node-kind {
  fill: var(--dsw-alias-label-caption);
  font-size: 8px;
}

[data-dsh-runtime-xray] .xray-network-node-label {
  fill: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 550;
}

[data-dsh-runtime-xray] .xray-runtime-map-section {
  padding: 16px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, var(--dsw-alias-border-l2));
  border-radius: 14px;
  background:
    radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--dsw-alias-state-business-primary) 11%, transparent), transparent 34%),
    color-mix(in srgb, var(--dsw-alias-bg-layer-2) 86%, transparent);
  box-shadow: var(--dsw-shadow-lv1);
}

[data-dsh-runtime-xray] .xray-map-legend {
  display: flex;
  min-height: 28px;
  align-items: center;
  gap: 14px;
  margin-bottom: 9px;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-map-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

[data-dsh-runtime-xray] .xray-map-legend i {
  display: inline-block;
  width: 18px;
  height: 3px;
  border-radius: 999px;
  background: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-map-legend i[data-edge='inferred'] {
  height: 1px;
  border-top: 2px dashed var(--dsw-alias-state-warn-primary);
  border-radius: 0;
  background: transparent;
}

[data-dsh-runtime-xray] .xray-map-legend i[data-node='scope'],
[data-dsh-runtime-xray] .xray-map-legend i[data-node='service'],
[data-dsh-runtime-xray] .xray-map-legend i[data-node='capability'],
[data-dsh-runtime-xray] .xray-map-legend i[data-node='context'],
[data-dsh-runtime-xray] .xray-map-legend i[data-node='request'] {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

[data-dsh-runtime-xray] .xray-map-legend i[data-node='capability'] {
  background: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-map-legend i[data-node='service'] {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-map-legend i[data-node='context'] {
  background: var(--dsw-alias-state-success-primary);
  opacity: 0.58;
}

[data-dsh-runtime-xray] .xray-map-legend i[data-node='request'] {
  background: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-map-hidden {
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--dsw-alias-state-warn-primary);
  background: var(--dsw-alias-state-warn-tertiary);
}

[data-dsh-runtime-xray] .xray-runtime-map {
  position: relative;
  height: 560px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dsw-alias-bg-layer-1) 90%, transparent), var(--dsw-alias-bg-layer-2));
  --xy-background-color: transparent;
  --xy-edge-stroke: var(--dsw-alias-border-l3);
  --xy-minimap-background-color: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 92%, transparent);
}

[data-dsh-runtime-xray] .xray-runtime-map .react-flow__node-runtime {
  width: 190px;
  height: 92px;
  padding: 0;
  border: 0;
  border-radius: 11px;
  background: transparent;
}

[data-dsh-runtime-xray] .xray-flow-node {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  align-content: center;
  padding: 11px 14px 10px 16px;
  gap: 2px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-left: 4px solid var(--dsw-alias-state-business-primary);
  border-radius: 11px;
  color: var(--dsw-alias-label-primary);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 94%, transparent);
  box-shadow: var(--dsw-shadow-lv2);
}

[data-dsh-runtime-xray] .xray-flow-node::after {
  position: absolute;
  top: -30px;
  right: -20px;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent);
  content: '';
}

[data-dsh-runtime-xray] .xray-flow-node[data-kind='preset'],
[data-dsh-runtime-xray] .xray-flow-node[data-kind='capability'] {
  border-left-color: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-flow-node[data-kind='session'],
[data-dsh-runtime-xray] .xray-flow-node[data-kind='service'],
[data-dsh-runtime-xray] .xray-flow-node[data-kind='context'],
[data-dsh-runtime-xray] .xray-flow-node[data-kind='request'] {
  border-left-color: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-flow-node[data-kind='request'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, var(--dsw-alias-border-l2));
  background: color-mix(in srgb, var(--dsw-alias-state-success-tertiary) 56%, var(--dsw-alias-bg-layer-2));
}

[data-dsh-runtime-xray] .react-flow__node.selected .xray-flow-node,
[data-dsh-runtime-xray] .xray-flow-node[data-selected='true'] {
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent), var(--dsw-shadow-lv2);
}

[data-dsh-runtime-xray] .xray-flow-node-eyebrow {
  position: relative;
  z-index: 1;
  color: var(--dsw-alias-label-caption);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-flow-node strong,
[data-dsh-runtime-xray] .xray-flow-node small {
  position: relative;
  z-index: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-flow-node strong {
  font: var(--dsw-font-s-strong-14);
}

[data-dsh-runtime-xray] .xray-flow-node small {
  display: block;
  height: 16px;
  color: var(--dsw-alias-label-tertiary);
  font: 10px/16px var(--ds-font-family-code);
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-flow-handle {
  width: 8px;
  height: 8px;
  border: 2px solid var(--dsw-alias-bg-layer-2);
  background: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .react-flow__edge.xray-flow-edge .react-flow__edge-path {
  stroke: color-mix(in srgb, var(--dsw-alias-state-business-primary) 56%, var(--dsw-alias-border-l3));
  stroke-width: 1.7;
}

[data-dsh-runtime-xray] .react-flow__edge.xray-flow-edge-inferred .react-flow__edge-path {
  stroke: var(--dsw-alias-state-warn-primary);
  stroke-dasharray: 6 5;
}

[data-dsh-runtime-xray] .react-flow__edge.xray-flow-edge-contributes .react-flow__edge-path {
  stroke: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .react-flow__edge.xray-flow-edge-context .react-flow__edge-path {
  stroke: var(--dsw-alias-state-success-primary);
  stroke-dasharray: 4 4;
  opacity: 0.72;
}

[data-dsh-runtime-xray] .react-flow__controls {
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  box-shadow: var(--dsw-shadow-lv2);
}

[data-dsh-runtime-xray] .react-flow__controls-button {
  width: 30px;
  min-width: 30px;
  min-height: 30px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  border-radius: 0;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
}

[data-dsh-runtime-xray] .react-flow__controls-button svg {
  fill: currentColor;
}

[data-dsh-runtime-xray] .react-flow__minimap {
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  box-shadow: var(--dsw-shadow-lv2);
}

[data-dsh-runtime-xray] .xray-map-help,
[data-dsh-runtime-xray] .xray-map-unavailable {
  margin: 9px 0 0;
  color: var(--dsw-alias-label-caption);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-snapshot-meta {
  grid-column: 1 / -1;
  margin-top: 4px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-snapshot-meta summary {
  width: fit-content;
  padding: 10px 0;
  cursor: pointer;
}

[data-dsh-runtime-xray] .xray-snapshot-meta dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 8px;
}

[data-dsh-runtime-xray] .xray-snapshot-meta dl > div {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
}

[data-dsh-runtime-xray] .xray-snapshot-meta dt {
  color: var(--dsw-alias-label-caption);
}

[data-dsh-runtime-xray] .xray-snapshot-meta dd {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--dsw-alias-label-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-request-tree {
  display: grid;
  justify-items: center;
  gap: 18px;
}

[data-dsh-runtime-xray] .xray-request-root {
  display: grid;
  min-width: 220px;
  padding: 10px 14px;
  gap: 2px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 38%, var(--dsw-alias-border-l2));
  border-radius: 9px;
  background: var(--dsw-alias-state-business-tertiary);
  text-align: center;
}

[data-dsh-runtime-xray] .xray-request-root span {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-request-branches {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

[data-dsh-runtime-xray] .xray-request-branches::before {
  display: none;
}

[data-dsh-runtime-xray] .xray-request-branch {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-top: 3px solid var(--dsw-alias-label-caption);
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 78%, transparent);
}

[data-dsh-runtime-xray] .xray-request-branch[data-kind='skills'] {
  border-top-color: var(--dsw-alias-state-business-primary);
}

[data-dsh-runtime-xray] .xray-request-branch[data-kind='tools'] {
  border-top-color: var(--dsw-alias-state-warn-primary);
}

[data-dsh-runtime-xray] .xray-request-branch[data-kind='sections'],
[data-dsh-runtime-xray] .xray-request-branch[data-kind='contexts'] {
  border-top-color: var(--dsw-alias-state-success-primary);
}

[data-dsh-runtime-xray] .xray-request-branch summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 10px 12px;
  cursor: pointer;
  font: var(--dsw-font-xxs-strong-12);
  list-style-position: inside;
}

[data-dsh-runtime-xray] .xray-request-branch summary span {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  color: var(--dsw-alias-label-tertiary);
  background: var(--dsw-alias-bg-module-platform);
}

[data-dsh-runtime-xray] .xray-request-branch ul {
  display: grid;
  max-height: 180px;
  margin: 0;
  padding: 0 12px 10px 28px;
  overflow: auto;
  gap: 3px;
}

[data-dsh-runtime-xray] .xray-request-branch li,
[data-dsh-runtime-xray] .xray-request-branch p {
  overflow: hidden;
  color: var(--dsw-alias-label-caption);
  font: 10px/15px var(--ds-font-family-code);
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-dsh-runtime-xray] .xray-request-branch p {
  margin: 0;
  padding: 0 12px 10px;
}

[data-dsh-runtime-xray] .xray-diagnostics {
  display: grid;
  gap: 5px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-state-warn-tertiary);
  border-radius: 8px;
  background: var(--dsw-alias-state-warn-tertiary);
  font: var(--dsw-font-xxxs-11);
}

[data-dsh-runtime-xray] .xray-details {
  width: min(380px, 36%);
  flex: none;
  margin-left: 16px;
  padding: 15px;
  overflow: auto;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-shadow-lv1);
}

[data-dsh-runtime-xray] .xray-details h3 {
  margin: 0;
  font: var(--dsw-font-s-strong-14);
}

[data-dsh-runtime-xray] .xray-details pre {
  max-height: 420px;
  padding: 10px;
  overflow: auto;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-1);
  white-space: pre-wrap;
  word-break: break-word;
  font: 11px/17px var(--ds-font-family-code);
}

[data-dsh-runtime-xray] .xray-status {
  padding: 13px;
  color: var(--dsw-alias-label-tertiary);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
}

@media (max-width: 840px) {
  [data-dsh-runtime-xray] .xray-topbar {
    align-items: flex-start;
  }

  [data-dsh-runtime-xray] .xray-scope-block {
    flex-wrap: wrap;
  }

  [data-dsh-runtime-xray] .xray-scope-hint {
    width: 100%;
    order: 3;
  }

  [data-dsh-runtime-xray] .xray-request-branches {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 640px) {
  [data-dsh-runtime-xray] .xray-topbar {
    flex-direction: column;
  }

  [data-dsh-runtime-xray] .xray-actions,
  [data-dsh-runtime-xray] .xray-scope-block {
    width: 100%;
  }

  [data-dsh-runtime-xray] .xray-actions .xray-action {
    flex: 1;
  }

  [data-dsh-runtime-xray] .xray-filterbar {
    flex-wrap: wrap;
  }

  [data-dsh-runtime-xray] .xray-search {
    width: 100%;
    margin-left: 0;
  }

  [data-dsh-runtime-xray] .xray-body {
    flex-direction: column;
    padding: 16px 12px 24px;
  }

  [data-dsh-runtime-xray] .xray-summary,
  [data-dsh-runtime-xray] .xray-overview {
    grid-template-columns: 1fr;
  }

  [data-dsh-runtime-xray] .xray-context-stats {
    grid-template-columns: 1fr;
  }

  [data-dsh-runtime-xray] .xray-effect-stats {
    grid-template-columns: 1fr;
  }

  [data-dsh-runtime-xray] .xray-entry-module {
    display: none;
  }

  [data-dsh-runtime-xray] .xray-details {
    width: auto;
    margin: 12px 0 0;
  }

  [data-dsh-runtime-xray] .xray-scope-tree {
    flex-direction: column;
  }

  [data-dsh-runtime-xray] .xray-scope-tree-step {
    flex-direction: column;
  }

  [data-dsh-runtime-xray] .xray-scope-connector {
    height: 26px;
    transform: none;
  }

  [data-dsh-runtime-xray] .xray-scope-node {
    width: 100%;
    box-sizing: border-box;
  }

  [data-dsh-runtime-xray] .xray-request-branches {
    grid-template-columns: 1fr;
  }

  [data-dsh-runtime-xray] .xray-runtime-map {
    height: 500px;
  }

  [data-dsh-runtime-xray] .xray-snapshot-meta dl {
    grid-template-columns: 1fr;
  }

  [data-dsh-runtime-xray] .xray-request-branches::before,
  [data-dsh-runtime-xray] .xray-request-branch-line {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-dsh-runtime-xray] button {
    transition: none;
  }
}
`
