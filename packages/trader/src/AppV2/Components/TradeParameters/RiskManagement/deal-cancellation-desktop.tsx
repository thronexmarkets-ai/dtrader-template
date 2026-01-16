import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Text, ToggleSwitch, useSnackbar } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';

import { getSnackBarText } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';

import { ValueChips } from '../../InputPopover';

type TDealCancellationDesktopProps = {
    closePopover: () => void;
};

const DealCancellationDesktop = observer(({ closePopover }: TDealCancellationDesktopProps) => {
    const {
        has_cancellation,
        has_take_profit,
        has_stop_loss,
        cancellation_range_list,
        cancellation_duration,
        onChangeMultiple,
    } = useTraderStore();
    const { addSnackbar } = useSnackbar();

    const [is_enabled, setIsEnabled] = React.useState(has_cancellation);
    const [selected_value, setSelectedValue] = React.useState(Number(cancellation_duration));

    // Create a map to store original values with their numeric equivalents
    const valueMap = React.useMemo(() => {
        const map = new Map<number, string>();
        cancellation_range_list.forEach(item => {
            const numValue = typeof item.value === 'string' ? parseInt(item.value) : item.value;
            if (!isNaN(numValue) && numValue > 0) {
                map.set(numValue, item.value);
            }
        });
        return map;
    }, [cancellation_range_list]);

    // Extract numeric values from cancellation_range_list
    const chipValues = React.useMemo(() => {
        return Array.from(valueMap.keys());
    }, [valueMap]);

    const formatValue = useCallback((value: number) => {
        return `${value} min`;
    }, []);

    const handleChipSelect = useCallback((value: number) => {
        setSelectedValue(value);
    }, []);

    const onSave = () => {
        if (has_cancellation === is_enabled && Number(cancellation_duration) === selected_value) {
            closePopover();
            return;
        }

        if (is_enabled && (has_take_profit || has_stop_loss)) {
            addSnackbar({
                message: getSnackBarText({
                    has_cancellation: is_enabled,
                    has_stop_loss,
                    has_take_profit,
                    switching_cancellation: true,
                }),
                hasCloseButton: true,
            });
        }

        // Get the original value format from the map (e.g., "15m" instead of "15")
        const original_value = valueMap.get(selected_value) || selected_value.toString();

        // We should switch off TP and SL if DC is on and vice versa
        onChangeMultiple({
            has_cancellation: is_enabled,
            ...(is_enabled ? { has_take_profit: false, has_stop_loss: false } : {}),
            cancellation_duration: original_value,
        });
        closePopover();
    };

    return (
        <div className='deal-cancellation-desktop__wrapper'>
            <div className='deal-cancellation-desktop__header'>
                <Text>
                    <Localize i18n_default_text='Deal cancellation' />
                </Text>
                <ToggleSwitch checked={is_enabled} onChange={setIsEnabled} />
            </div>
            <div className='deal-cancellation-desktop__chips'>
                <ValueChips
                    values={chipValues}
                    selectedValue={selected_value}
                    onSelect={handleChipSelect}
                    formatValue={formatValue}
                    className={!is_enabled ? 'value-chips--disabled' : ''}
                />
            </div>
            <div className='deal-cancellation-desktop__footer'>
                <Button
                    fullWidth
                    size='lg'
                    variant='primary'
                    color='black-white'
                    onClick={onSave}
                    className='deal-cancellation-desktop__save-button'
                >
                    <Localize i18n_default_text='Save' />
                </Button>
            </div>
        </div>
    );
});

export default DealCancellationDesktop;
