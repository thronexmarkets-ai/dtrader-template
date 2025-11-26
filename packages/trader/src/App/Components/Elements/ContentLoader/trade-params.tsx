import React from 'react';
import ContentLoader from 'react-content-loader';

const TradeParamsLoader = ({ speed }: { speed: number }) => {
    return (
        <ContentLoader
            height={598}
            width={240}
            speed={speed}
            backgroundColor={'var(--color-surface-section)'}
            foregroundColor={'var(--color-interactive-hover)'}
        >
            <rect x='0' y='0' rx='4' ry='4' width='240' height='50' />
            <rect x='0' y='58' rx='4' ry='4' width='240' height='76' />
            <rect x='0' y='142' rx='4' ry='4' width='240' height='132' />
            <rect x='0' y='282' rx='4' ry='4' width='240' height='120' />
            <rect x='0' y='410' rx='4' ry='4' width='240' height='194' />
        </ContentLoader>
    );
};

export { TradeParamsLoader };
