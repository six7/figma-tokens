import * as React from 'react';

export default function TabButton({name = '', label, active, setActive, first = false}) {
    return (
        <button
            type="button"
            className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer hover:text-black
    ${active ? 'text-black' : 'text-gray-500'}
    ${first ? 'pl-4' : ''}`}
            name="text"
            onClick={() => setActive(name)}
        >
            {label}
        </button>
    );
}
