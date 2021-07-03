import * as React from 'react';

const Input = ({
    name,
    error = '',
    required = false,
    tabindex = null,
    label = null,
    full,
    onChange,
    value,
    type,
    custom = '',
    inputRef = null,
}) => {
    return (
        <label htmlFor={name} className="text-xxs font-medium block">
            <div className="flex items-center justify-between">
                {label ? <div>{label}</div> : null}
                {error ? <div className="text-red-500 font-bold">{error}</div> : null}
            </div>
            <input
                tabIndex={tabindex}
                type={type}
                value={value}
                className={`input ${full && 'w-full'}`}
                name={name}
                onChange={onChange}
                required={required}
                data-custom={custom}
                ref={inputRef}
            />
        </label>
    );
};

export default Input;
