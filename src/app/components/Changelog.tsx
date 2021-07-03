import * as React from 'react';
import {useSelector} from 'react-redux';
import Heading from './Heading';
import Button from './Button';
import Modal from './Modal';
import {RootState} from '../store';

export default function Changelog() {
    const [changelogOpen, setChangelogOpen] = React.useState(true);
    const {changelog} = useSelector((state: RootState) => state.uiState);

    const [activeIndex, setIndex] = React.useState(0);

    const handleNext = () => {
        setIndex(activeIndex + 1);
    };

    const handlePrev = () => {
        setIndex(activeIndex - 1);
    };

    return (
        <Modal showClose isOpen={changelog.length > 0 && changelogOpen} close={() => setChangelogOpen(false)}>
            <div className="space-y-8">
                <div>
                    {changelog.map((item, index) => {
                        return (
                            <div
                                // eslint-disable-next-line no-underscore-dangle
                                key={item._uid}
                                className={`space-y-2 flex flex-col items-center text-center ${
                                    index === activeIndex ? 'visible' : 'hidden'
                                }`}
                            >
                                {item.image && (
                                    <img src={item.image.filename} alt={item.image.alt} className="rounded mb-8" />
                                )}
                                <Heading>{item.title}</Heading>
                                <p className="text-xs">{item.excerpt}</p>
                                {item.read_more_link && (
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={item.read_more_link}
                                        className="inline-flex text-primary-500 text-xs"
                                    >
                                        Read more
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <Button id="button-changelog-close" onClick={() => setChangelogOpen(false)} variant="secondary">
                        Close
                    </Button>
                    <div className="flex flex-row justify-between gap-2">
                        {activeIndex !== 0 && (
                            <Button id="button-changelog-prev" onClick={handlePrev} variant="secondary">
                                Previous
                            </Button>
                        )}
                        {changelog.length > activeIndex + 1 && (
                            <Button id="button-changelog-next" variant="primary" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
