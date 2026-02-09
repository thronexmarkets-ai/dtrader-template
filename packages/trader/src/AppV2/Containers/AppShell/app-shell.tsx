import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import {
    StandaloneChartAreaFillIcon,
    StandaloneChartAreaRegularIcon,
    StandaloneClockThreeFillIcon,
    StandaloneClockThreeRegularIcon,
} from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { Badge } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import Sidebar from 'App/Components/Layout/Sidebar/sidebar';
import BottomNav from 'AppV2/Components/BottomNav';

import Router from '../../Routes/router';

import './app-shell.scss';

const AppShell = observer(() => {
    const { portfolio, client, ui } = useStore();
    const { is_logged_in } = client;
    const { active_positions_count } = portfolio;
    const { active_sidebar_flyout } = ui;
    const { isMobile } = useDevice();

    const renderPositionIcon = (IconComponent: typeof StandaloneClockThreeRegularIcon) => {
        const icon = <IconComponent iconSize='sm' />;
        if (active_positions_count > 0) {
            return (
                <Badge
                    variant='notification'
                    position='top-right'
                    label={active_positions_count.toString()}
                    color='danger'
                    size='sm'
                    contentSize='sm'
                    className='bottom-nav-item__position-badge'
                >
                    {icon}
                </Badge>
            );
        }
        return icon;
    };

    const bottomNavItems = [
        {
            icon: <StandaloneChartAreaRegularIcon iconSize='sm' />,
            activeIcon: <StandaloneChartAreaFillIcon iconSize='sm' />,
            label: <Localize i18n_default_text='Trade' />,
            path: routes.index,
        },
        {
            icon: renderPositionIcon(StandaloneClockThreeRegularIcon),
            activeIcon: renderPositionIcon(StandaloneClockThreeFillIcon),
            label: (
                <React.Fragment>
                    <span className='user-guide__anchor' />
                    <Localize i18n_default_text='Positions' />
                </React.Fragment>
            ),
            path: routes.trader_positions,
        },
    ];

    const should_show_bottomnav =
        isMobile && is_logged_in && !window.location.pathname.startsWith(routes.contract.replace('/:contract_id', ''));

    return (
        <div className='app-shell'>
            {!isMobile && <Sidebar />}
            <Router />
            {should_show_bottomnav && <BottomNav bottomNavItems={bottomNavItems} />}
        </div>
    );
});

export default AppShell;
