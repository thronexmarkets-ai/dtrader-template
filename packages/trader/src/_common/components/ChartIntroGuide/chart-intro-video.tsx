import React from 'react';
import clsx from 'clsx';

import { Skeleton } from '@deriv-com/quill-ui';

import { ASPECT_RATIO } from 'AppV2/Utils/layout-utils';

type TChartIntroVideoProps = {
    video_id: string;
    is_mobile?: boolean;
};

const ChartIntroVideo = ({ video_id, is_mobile = false }: TChartIntroVideoProps) => {
    const [is_loading, setIsLoading] = React.useState(true);

    const params = [
        'letterboxColor=transparent',
        'muted=true',
        'preload=auto',
        'loop=false',
        'autoplay=true',
        'controls=false',
    ].join('&');

    const container_class = is_mobile
        ? 'chart-intro-guide__video-container'
        : 'chart-intro-guide__video-container--desktop';

    return (
        <div
            className={clsx(container_class, is_loading && 'chart-intro-guide__video-container--loading')}
            data-testid='dt_chart_intro_video'
        >
            {is_loading && <Skeleton.Square height={`calc(100vw * ${ASPECT_RATIO})`} width='100%' />}
            <iframe
                allowFullScreen={false}
                className='chart-intro-guide__video-iframe'
                width='100%'
                height='100%'
                src={`https://iframe.cloudflarestream.com/${video_id}?${params}`}
                data-testid='dt_chart_intro_stream_iframe'
                title='chart_intro_guide'
                onLoad={() => setIsLoading(false)}
                style={{
                    ...(is_mobile ? {} : { border: 'none' }),
                    display: is_loading ? 'none' : 'block',
                }}
            />
        </div>
    );
};

export default ChartIntroVideo;
