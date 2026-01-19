/**
 * Trade Parameter Presets Configuration
 *
 * This file contains centralized preset values for trade parameters used in value chips.
 * These presets provide quick-select options for users when configuring trades.
 *
 * @module TradeParameterPresets
 */

/**
 * Duration preset values for different time units
 */
export interface DurationPresets {
    /** Preset values for tick-based durations */
    ticks: number[];
    /** Preset values for second-based durations */
    seconds: number[];
    /** Preset values for minute-based durations */
    minutes: number[];
    /** Preset values for hour-based durations (displayed in hours but stored as minutes) */
    hours: number[];
    /** Preset time values for end time selection (HH:MM format) */
    endTime: string[];
    /** Preset values for end date selection (days from now) */
    endDate: number[];
}

/**
 * Stake preset values for different platforms
 */
export interface StakePresets {
    /** Preset stake amounts for desktop interface */
    desktop: number[];
    /** Preset stake amounts for mobile interface (includes more options) */
    mobile: number[];
}

/**
 * Complete trade parameter presets configuration
 */
export interface TradeParameterPresets {
    /** Duration-related presets */
    duration: DurationPresets;
    /** Stake-related presets */
    stake: StakePresets;
}

/**
 * Centralized configuration for all trade parameter preset values.
 *
 * Usage:
 * ```typescript
 * import { TRADE_PARAMETER_PRESETS } from 'AppV2/Config/trade-parameter-presets';
 *
 * // Access duration presets
 * const tickValues = TRADE_PARAMETER_PRESETS.duration.ticks;
 *
 * // Access stake presets
 * const desktopStakes = TRADE_PARAMETER_PRESETS.stake.desktop;
 * ```
 */
export const TRADE_PARAMETER_PRESETS: TradeParameterPresets = {
    duration: {
        ticks: [1, 2, 3, 4, 5, 6, 7, 8],
        seconds: [1, 20, 25, 30, 40, 50],
        minutes: [1, 2, 3, 4, 5, 10],
        hours: [1, 2, 3, 4, 6, 8],
        endTime: ['07:30', '07:35', '07:40', '07:45', '07:50', '07:55'],
        endDate: [1, 2, 3, 5, 7, 10], // Days from now
    },
    stake: {
        desktop: [1, 5, 10, 15, 20, 25],
        mobile: [1, 5, 10, 15, 20, 25, 30, 40, 50, 100],
    },
};
