import React from 'react';

import { Stream } from '@cloudflare/stream-react';
import { LabelPairedPlayMdFillIcon } from '@deriv/quill-icons';
import { Localize } from '@deriv-com/translations';
import { CaptionText } from '@deriv-com/quill-ui';
import { useDevice } from '@deriv-com/ui';

type TVideoPreview = {
    contract_type: string;
    toggleVideoPlayer?: () => void;
    video_src: string;
};

const VideoPreview = ({ contract_type, toggleVideoPlayer, video_src }: TVideoPreview) => {
    const [is_playing, setIsPlaying] = React.useState(false);
    const { isDesktop } = useDevice();

    const handlePlayClick = () => {
        if (isDesktop) {
            // Desktop: play inline
            setIsPlaying(true);
        } else if (toggleVideoPlayer) {
            // Mobile: open fullscreen modal
            toggleVideoPlayer();
        }
    };

    return (
        <div className='guide-video__wrapper'>
            {!isDesktop || !is_playing ? (
                <>
                    <div
                        className='guide-video__preview'
                        data-testid='dt_video_preview'
                        onClick={handlePlayClick}
                        onKeyDown={handlePlayClick}
                    >
                        <Stream
                            className='guide-video'
                            letterboxColor='transparent'
                            muted
                            preload='auto'
                            responsive={false}
                            src={video_src}
                            width={isDesktop ? '448px' : '112px'}
                            height={isDesktop ? '252px' : '73px'}
                            autoplay
                        />
                        <div className='guide-video__preview__icon__wrapper'>
                            <LabelPairedPlayMdFillIcon className='guide-video__preview__icon' />
                        </div>
                    </div>
                    {!isDesktop && (
                        <div className='guide-video__description'>
                            <CaptionText bold>
                                <Localize
                                    i18n_default_text='How to trade {{contract_type}}?'
                                    values={{ contract_type }}
                                />
                            </CaptionText>
                            <CaptionText>
                                <Localize i18n_default_text='Watch this video to learn about this trade type.' />
                            </CaptionText>
                        </div>
                    )}
                </>
            ) : (
                <div className='guide-video__player' data-testid='dt_video_player'>
                    <Stream
                        className='guide-video'
                        letterboxColor='transparent'
                        muted
                        preload='auto'
                        responsive={false}
                        src={video_src}
                        width='448px'
                        height='252px'
                        controls
                        autoplay
                    />
                </div>
            )}
        </div>
    );
};

export default VideoPreview;
