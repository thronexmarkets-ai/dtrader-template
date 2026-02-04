import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import moment from 'moment';

import { toMoment, useIsMounted } from '@deriv/shared';
import { Button, DatePicker, TextField } from '@deriv-com/quill-ui';
import { Localize, useTranslations } from '@deriv-com/translations';

import { InputPopover } from 'AppV2/Components/InputPopover';
import { ContractType } from 'Stores/Modules/Trading/Helpers/contract-type';
import { useTraderStore } from 'Stores/useTraderStores';

import './duration-end-date-desktop.scss';

interface DurationEndDateDesktopProps {
    onClose: () => void;
}

const DurationEndDateDesktop: React.FC<DurationEndDateDesktopProps> = observer(({ onClose }) => {
    const { localize } = useTranslations();
    const { expiry_date, duration_unit, duration, duration_min_max, symbol, onChangeMultiple } = useTraderStore();
    const isMounted = useIsMounted();

    // Calculate initial date based on duration_unit and duration
    const getInitialDate = () => {
        // If duration_unit is 'd' (days) and duration exists, calculate from duration
        if (duration_unit === 'd' && duration) {
            return moment().add(duration, 'days').toDate();
        }
        // Otherwise, use expiry_date if available
        if (expiry_date) {
            return moment(expiry_date).toDate();
        }
        // Default to tomorrow
        return moment().add(1, 'day').toDate();
    };

    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [disabled_days, setDisabledDays] = useState<number[]>([]);
    const field_ref = useRef<HTMLDivElement>(null);

    const onChangeCalendarMonth = useCallback(
        async (e = toMoment().format('YYYY-MM-DD')) => {
            let new_disabled_days: number[] = [];

            const trading_days = await ContractType.getTradingDays(e, symbol);

            if (trading_days) {
                const all_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
                new_disabled_days = all_days
                    .map((day: (typeof all_days)[number], index) => (!trading_days.includes(day) ? index : -1))
                    .filter(index => index !== -1);
            }

            if (isMounted()) {
                setDisabledDays(new_disabled_days);
            }
        },
        [isMounted, symbol]
    );

    useEffect(() => {
        onChangeCalendarMonth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync selectedDate with expiry_date when it changes (e.g., when modal reopens after save)
    useEffect(() => {
        if (expiry_date) {
            setSelectedDate(moment(expiry_date).toDate());
        }
    }, [expiry_date]);

    const getDisabledDays = useCallback(
        ({ date }: { date: Date }) => {
            const day = date.getDay();
            return disabled_days.includes(day);
        },
        [disabled_days]
    );

    const handleDateClick = useCallback(() => {
        setIsPickerOpen(true);
    }, []);

    const handleDateChange = useCallback((value: Date | Date[] | null | [Date | null, Date | null]) => {
        if (value && value instanceof Date) {
            setSelectedDate(value);
        } else if (Array.isArray(value) && value[0] instanceof Date) {
            setSelectedDate(value[0]);
        }
    }, []);

    const handlePickerClose = useCallback(() => {
        setIsPickerOpen(false);
    }, []);

    const handleSave = useCallback(() => {
        onChangeMultiple({
            expiry_type: 'endtime',
            expiry_date: moment(selectedDate).format('YYYY-MM-DD'),
            expiry_time: '23:59:59',
        });
        onClose();
    }, [selectedDate, onChangeMultiple, onClose]);

    // Calculate expiry message
    const getExpiryMessage = useCallback(() => {
        return localize('Contract will expire at 23:59:59 GMT on the selected date.');
    }, [localize]);

    // Format date for display
    const getFormattedDate = useCallback(() => {
        return moment(selectedDate).format('DD/MM/YYYY');
    }, [selectedDate]);

    // Calculate min and max dates
    const getMinDate = useCallback(() => {
        const tomorrow = moment().add(1, 'day');
        return tomorrow.toDate();
    }, []);

    const getMaxDate = useCallback(() => {
        // Use duration_min_max if available, otherwise default to 365 days
        const maxDays = duration_min_max?.daily?.max || 365;
        const maxDate = moment().add(maxDays, 'days');
        return maxDate.toDate();
    }, [duration_min_max]);

    return (
        <div className='duration-input-desktop__wrapper'>
            <div ref={field_ref}>
                <TextField
                    label={localize('End date')}
                    name='end_date'
                    value={getFormattedDate()}
                    onClick={handleDateClick}
                    readOnly
                    variant='fill'
                    status='neutral'
                    noStatusIcon
                    data-testid='dt_duration_end_date_input_desktop'
                />
            </div>
            <div className='duration-end-date-desktop__message'>{getExpiryMessage()}</div>

            <InputPopover
                isOpen={isPickerOpen}
                onClose={handlePickerClose}
                triggerRef={field_ref}
                className='duration-end-date-desktop__popover'
                popoverWidth={312}
                placement='bottom'
                spacing={4}
            >
                <div className='duration-end-date-desktop__picker-content'>
                    <DatePicker
                        hasFixedWidth={false}
                        minDate={getMinDate()}
                        maxDate={getMaxDate()}
                        view='month'
                        value={selectedDate}
                        onChange={handleDateChange}
                        tileDisabled={getDisabledDays}
                    />
                    <div className='duration-input-desktop__footer'>
                        <Button
                            size='lg'
                            color='black-white'
                            variant='primary'
                            fullWidth
                            onClick={handleSave}
                            className='duration-input-desktop__save-button'
                        >
                            <Localize i18n_default_text='Done' />
                        </Button>
                    </div>
                </div>
            </InputPopover>
        </div>
    );
});

export default DurationEndDateDesktop;
