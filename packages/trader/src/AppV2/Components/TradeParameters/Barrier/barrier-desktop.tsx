import React, { useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { Localize } from '@deriv-com/translations';

import { TradeParameterPopover, useTradeParameterPopover } from 'AppV2/Components/TradeParameters/Shared';
import { useTraderStore } from 'Stores/useTraderStores';

import BarrierContentDesktop from './barrier-content-desktop';
import BarrierTypeSelector from './barrier-type-selector';

interface BarrierDesktopProps {
    is_minimized?: boolean;
}

const getBarrierType = (barrier: string): string => {
    if (!barrier) return 'above_spot';
    if (barrier.startsWith('+')) return 'above_spot';
    if (barrier.startsWith('-')) return 'below_spot';
    return 'fixed_barrier';
};

const BarrierPopoverContent: React.FC<{
    selectedType: string;
    onSelectType: (type: string) => void;
}> = ({ selectedType, onSelectType }) => {
    const { closePopover } = useTradeParameterPopover();

    return (
        <div className='barrier-popover__layout'>
            <div className='barrier-popover__sidebar'>
                <BarrierTypeSelector selectedType={selectedType} onSelectType={onSelectType} />
            </div>
            <div className='barrier-popover__main'>
                <div className='barrier-popover__content'>
                    <BarrierContentDesktop barrierType={selectedType} onClose={closePopover} />
                </div>
            </div>
        </div>
    );
};

const BarrierDesktop: React.FC<BarrierDesktopProps> = observer(({ is_minimized }) => {
    const { barrier_1, is_market_closed } = useTraderStore();

    const initialType = useMemo(() => getBarrierType(barrier_1), [barrier_1]);
    const [selectedType, setSelectedType] = useState(initialType);

    const handleTypeSelect = useCallback((type: string) => {
        setSelectedType(type);
    }, []);

    return (
        <TradeParameterPopover
            popoverWidth={360}
            label={<Localize i18n_default_text='Barrier' key={`barrier${is_minimized ? '-minimized' : ''}`} />}
            value={barrier_1}
            is_minimized={is_minimized}
            disabled={is_market_closed}
            popover_classname='barrier-popover'
        >
            <BarrierPopoverContent selectedType={selectedType} onSelectType={handleTypeSelect} />
        </TradeParameterPopover>
    );
});

export default BarrierDesktop;
