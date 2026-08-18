/** Pure client-side search and filter projection over detached rows. */
export type StatusFilter = 'all' | 'active' | 'failed' | 'available' | 'partial' | 'ready' | 'enabled' | 'disabled';
export type QualityFilter = 'all' | 'exact' | 'inferred' | 'unavailable';
export interface SearchRow {
    readonly id: string;
    readonly label: string;
    readonly secondary: string;
    readonly status: string;
    readonly entity: object;
}
/** Filter without recollecting or mutating the detached snapshot. */
export declare function filterRows<T extends SearchRow>(rows: readonly T[], query: string, statusFilter: StatusFilter, qualityFilter: QualityFilter): readonly T[];
